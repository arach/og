import AppKit
import WebKit

struct Options {
    var inputPath: String?
    var outputPath = "og.png"
    var width = 1200
    var height = 630
    var scale = 2
    var timeout = 60.0
}

func parseArgs() -> Options? {
    var opts = Options()
    var positional: [String] = []
    var i = 1

    while i < CommandLine.arguments.count {
        let arg = CommandLine.arguments[i]
        switch arg {
        case "-o", "--output":
            i += 1
            guard i < CommandLine.arguments.count else { return nil }
            opts.outputPath = CommandLine.arguments[i]
        case "-w", "--width":
            i += 1
            guard i < CommandLine.arguments.count, let v = Int(CommandLine.arguments[i]) else { return nil }
            opts.width = v
        case "-h", "--height":
            i += 1
            guard i < CommandLine.arguments.count, let v = Int(CommandLine.arguments[i]) else { return nil }
            opts.height = v
        case "-s", "--scale":
            i += 1
            guard i < CommandLine.arguments.count, let v = Int(CommandLine.arguments[i]) else { return nil }
            opts.scale = max(1, v)
        case "--timeout":
            i += 1
            guard i < CommandLine.arguments.count, let v = Double(CommandLine.arguments[i]) else { return nil }
            opts.timeout = v
        case "--help":
            printUsage()
            exit(0)
        default:
            positional.append(arg)
        }
        i += 1
    }

    if positional.count == 1 {
        opts.inputPath = positional[0]
    } else if positional.count > 1 {
        return nil
    }

    return opts
}

func printUsage() {
    fputs("""
    og-render — render HTML to PNG using system WebKit

    Usage:
      og-render [options] [input.html]
      cat page.html | og-render -o out.png

    Options:
      -o, --output <path>   Output PNG path (default: og.png)
      -w, --width <px>      Viewport width (default: 1200)
      -h, --height <px>     Viewport height (default: 630)
      -s, --scale <n>       Device scale factor (default: 2)
          --timeout <sec>   Render timeout (default: 60)
          --help            Show this help

    """, stderr)
}

func readHTML(from path: String?) throws -> String {
    if let path {
        return try String(contentsOfFile: path, encoding: .utf8)
    }
    let data = FileHandle.standardInput.readDataToEndOfFile()
    guard let text = String(data: data, encoding: .utf8) else {
        throw NSError(domain: "og-render", code: 1, userInfo: [NSLocalizedDescriptionKey: "stdin is not valid UTF-8"])
    }
    return text
}

final class Renderer: NSObject, WKNavigationDelegate {
    private let webView: WKWebView
    private let outputPath: String
    private let width: Int
    private let height: Int
    private let scale: Int
    private var didComplete = false

    init(html: String, outputPath: String, width: Int, height: Int, scale: Int) {
        self.outputPath = outputPath
        self.width = width
        self.height = height
        self.scale = scale

        let config = WKWebViewConfiguration()
        webView = WKWebView(
            frame: NSRect(x: 0, y: 0, width: width, height: height),
            configuration: config
        )
        webView.clipsToBounds = false

        super.init()
        webView.navigationDelegate = self
        webView.loadHTMLString(html, baseURL: URL(string: "https://og.local/"))
    }

    func start(timeout: TimeInterval) {
        DispatchQueue.main.asyncAfter(deadline: .now() + timeout) { [weak self] in
            guard let self, !self.didComplete else { return }
            self.fail("timed out after \(timeout)s")
        }
    }

    func webView(_ webView: WKWebView, didFinish navigation: WKNavigation!) {
        webView.evaluateJavaScript(
            """
            (async () => {
              await document.fonts.ready;
              const fonts = [...document.fonts];
              if (fonts.length > 0) {
                await Promise.all(fonts.map((font) => font.load().catch(() => null)));
              }
              return true;
            })()
            """
        ) { [weak self] _, _ in
            DispatchQueue.main.asyncAfter(deadline: .now() + 0.35) {
                self?.snapshot()
            }
        }
    }

    func webView(_ webView: WKWebView, didFail navigation: WKNavigation!, withError error: Error) {
        fail(error.localizedDescription)
    }

    func webView(_ webView: WKWebView, didFailProvisionalNavigation navigation: WKNavigation!, withError error: Error) {
        fail(error.localizedDescription)
    }

    private func snapshot() {
        let config = WKSnapshotConfiguration()
        config.rect = CGRect(x: 0, y: 0, width: width, height: height)
        if scale > 1 {
            config.snapshotWidth = NSNumber(value: width * scale)
        }

        webView.takeSnapshot(with: config) { [weak self] image, error in
            guard let self else { return }
            if let error {
                self.fail(error.localizedDescription)
                return
            }
            guard let image,
                  let tiff = image.tiffRepresentation,
                  let rep = NSBitmapImageRep(data: tiff),
                  let png = rep.representation(using: .png, properties: [:]) else {
                self.fail("failed to encode PNG")
                return
            }

            do {
                try png.write(to: URL(fileURLWithPath: self.outputPath))
                self.didComplete = true
                NSApplication.shared.terminate(nil)
            } catch {
                self.fail(error.localizedDescription)
            }
        }
    }

    private func fail(_ message: String) {
        guard !didComplete else { return }
        didComplete = true
        fputs("og-render: \(message)\n", stderr)
        exit(1)
    }
}

guard let options = parseArgs() else {
    printUsage()
    exit(1)
}

let html: String
do {
    html = try readHTML(from: options.inputPath)
} catch {
    fputs("og-render: failed to read HTML: \(error)\n", stderr)
    exit(1)
}

let app = NSApplication.shared
app.setActivationPolicy(.accessory)

let renderer = Renderer(
    html: html,
    outputPath: options.outputPath,
    width: options.width,
    height: options.height,
    scale: options.scale
)
renderer.start(timeout: options.timeout)

RunLoop.main.run()