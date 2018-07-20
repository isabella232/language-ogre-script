'use strict'

var vscode = require('vscode')

const documentSelector = ["ogre-material-script", "ogre-compositor-script"]

class SymbolProvider {
    provideDocumentSymbols(document, token) {
        var ret = new Array()
        var re = /\b(material|(?:geometry|vertex|fragment|compute|tessellation_hull|tessellation_domain)_program)\b\s+(".*"|\S+)/
        var classid = "material"

        if(document.languageId == "ogre-compositor-script")
        {
            re = /\b(compositor)\b\s+(".*"|\S+)/
            classid = "compositor"
        }

        for (var i = 0; i < document.lineCount; i++) {
            var line = document.lineAt(i)
            var end = line.text.indexOf("//")
            var match = line.text.substring(0, end == -1 ? line.text.length : end).match(re)
            if (match) {
                ret.push(new vscode.DocumentSymbol(
                    match[2],
                    match[1],
                    match[1] == classid ? vscode.SymbolKind.Class : vscode.SymbolKind.Object,
                    line.range,
                    line.range
                ))
            }
        }
        return ret
    }
}

class ColorProvider {
    provideDocumentColors(document, token) {
        var ret = new Array()
        var re = /\b(ambient|diffuse|emissive|tex_border_colour|colour_value)\s+\b(.+)/

        for (var i = 0; i < document.lineCount; i++) {
            var line = document.lineAt(i)
            var end = line.text.indexOf("//")
            var match = line.text.substring(0, end == -1 ? line.text.length : end).match(re)
            if (match) {
                var v = match[2].split(" ", 4).map(x => +x)
                if (v.length < 3) continue // e.g. vertexcolour
                if (v.length < 4) v.push(1)

                var range = new vscode.Range(i, match.index + match[1].length + 1, i, line.text.length)

                ret.push({
                    color: new vscode.Color(...v),
                    range: range
                })
            }
        }
        return ret
    }

    provideColorPresentations(c, context, token) {
        var vals = [c.red, c.green, c.blue, c.alpha].map(x => x.toFixed(2))
        return [new vscode.ColorPresentation(vals.join(" "))]
    }
}

function activate(ctx) {
    ctx.subscriptions.push(
        vscode.languages.registerDocumentSymbolProvider(
            documentSelector, new SymbolProvider()))
    ctx.subscriptions.push(
        vscode.languages.registerColorProvider(
            documentSelector, new ColorProvider()))
}

Object.defineProperty(exports, "__esModule", { value: true })
exports.activate = activate