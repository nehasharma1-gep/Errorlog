import {  ErrorHandler, Injectable,Component, NgModule } from '@angular/core';
import { OnInit } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';



console.log("hi");


@Injectable()
export class CustomErrorHandler implements ErrorHandler {
  constructor() { }
  handleError(error) {
    // your custom error handling logic
    console.log("hi");
  }
}
@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.css'],
 
})


@NgModule({
  imports: [BrowserModule],
  declarations: [AppComponent],
  bootstrap: [AppComponent]
  
})





export class AppComponent  implements OnInit {

  title = 'app';
  s: string = "Hello2";
  errorString:string="";
 constructor(private _http:HttpClient)
 {
 // console.log(this.s) 

 }


ngOnInit(): void {
    console.log(this.s) 
  	var debugMode = true;
	  var logErrorURL = "https://localhost:44343/api/ErrorLog/";
    var Options;
	  window.onerror = function(msg, url, lineNum) {
		var stackTraceInfo = printStackTrace(Options);
		var errorInfo = {
			url:        url,
			lineNum:    lineNum,
			stackTrace: stackTraceInfo.stackTrace,
			browser:    stackTraceInfo.browser
		};
    this.errorString=JSON.stringify(errorInfo);
    console.log(this.errorString);

  };

	function printStackTrace(options) {
		options = options || {guess: true};
		var ex = options.e || null, guess = !!options.guess;
		
		var p = new printStackTrace.implementation();
		var response = p.run(ex);
		if (guess) {
			response.stackTrace = p.guessAnonymousFunctions(response.stackTrace);
		}
		return response;
	}

	if (typeof module !== "undefined" && module.exports) {
		module.exports = printStackTrace;
	}

	printStackTrace.implementation = function() { };

	printStackTrace.implementation.prototype = {
	
		run: function(ex, mode) {
			ex = ex || this.createException();
			mode = mode || this.mode(ex);
			var stackTrace;
			if (mode === 'other') {
				stackTrace = this.other(arguments.callee);
			} else {
				stackTrace = this[mode](ex);
			}

			return {
				browser: mode,  
				stackTrace: stackTrace
			};
		},

		createException: function() {
			try {
				this.undef();
			} catch (e) {
				return e;
			}
		},

		
		mode: function(e) {
			if (e['arguments'] && e.stack) {
				return 'chrome';
			} else if (e.stack && e.sourceURL) {
				return 'safari';
			} else if (e.stack && e.number) {
				return 'ie';
			} else if (typeof e.message === 'string' && typeof window !== 'undefined' ) {
			
				if (!e.stacktrace) {
                    return 'opera9'; 
                	}
				// 'opera#sourceloc' in e -> opera9, opera10a
				if (e.message.indexOf('\n') > -1 && e.message.split('\n').length > e.stacktrace.split('\n').length) {
					return 'opera9'; // use e.message
				}
				// e.stacktrace && !e.stack -> opera10a
				if (!e.stack) {
					return 'opera10a'; // use e.stacktrace
				}
				// e.stacktrace && e.stack -> opera10b
				if (e.stacktrace.indexOf("called from line") < 0) {
					return 'opera10b'; // use e.stacktrace, format differs from 'opera10a'
				}
				// e.stacktrace && e.stack -> opera11
				return 'opera11'; // use e.stacktrace, format differs from 'opera10a', 'opera10b'
			} else if (e.stack) {
				return 'firefox';
			}
			return 'other';
		},

		
		instrumentFunction: function(context, functionName, callback) {
			context = context || window;
			var original = context[functionName];
			context[functionName] = function instrumented() {
				callback.call(this, printStackTrace(Options).slice(4));
				return context[functionName]._instrumented.apply(this, arguments);
			};
			context[functionName]._instrumented = original;
		},

		
		deinstrumentFunction: function(context, functionName) {
			if (context[functionName].constructor === Function &&
					context[functionName]._instrumented &&
					context[functionName]._instrumented.constructor === Function) {
				context[functionName] = context[functionName]._instrumented;
			}
		},

		
		chrome: function(e) {
			var stack = (e.stack + '\n').replace(/^\S[^\(]+?[\n$]/gm, '').
				replace(/^\s+(at eval )?at\s+/gm, '').
				replace(/^([^\(]+?)([\n$])/gm, '{anonymous}()@$1$2').
				replace(/^Object.<anonymous>\s*\(([^\)]+)\)/gm, '{anonymous}()@$1').split('\n');
			stack.pop();
			return stack;
		},

		safari: function(e) {
			return e.stack.replace(/\[native code\]\n/m, '')
				.replace(/^(?=\w+Error\:).*$\n/m, '')
				.replace(/^@/gm, '{anonymous}()@')
				.split('\n');
		},

		
		ie: function(e) {
			var lineRE = /^.*at (\w+) \(([^\)]+)\)$/gm;
			return e.stack.replace(/at Anonymous function /gm, '{anonymous}()@')
				.replace(/^(?=\w+Error\:).*$\n/m, '')
				.replace(lineRE, '$1@$2')
				.split('\n');
		},

		firefox: function(e) {
			return e.stack.replace(/(?:\n@:0)?\s+$/m, '').replace(/^[\(@]/gm, '{anonymous}()@').split('\n');
		},

		opera11: function(e) {
			var ANON = '{anonymous}', lineRE = /^.*line (\d+), column (\d+)(?: in (.+))? in (\S+):$/;
			var lines = e.stacktrace.split('\n'), result = [];

			for (var i = 0, len = lines.length; i < len; i += 2) {
				var match = lineRE.exec(lines[i]);
				if (match) {
					var location = match[4] + ':' + match[1] + ':' + match[2];
					var fnName = match[3] || "global code";
					fnName = fnName.replace(/<anonymous function: (\S+)>/, "$1").replace(/<anonymous function>/, ANON);
					result.push(fnName + '@' + location + ' -- ' + lines[i + 1].replace(/^\s+/, ''));
				}
			}

			return result;
		},

		opera10b: function(e) {
		
			var lineRE = /^(.*)@(.+):(\d+)$/;
			var lines = e.stacktrace.split('\n'), result = [];

			for (var i = 0, len = lines.length; i < len; i++) {
				var match = lineRE.exec(lines[i]);
				if (match) {
					var fnName = match[1]? (match[1] + '()') : "global code";
					result.push(fnName + '@' + match[2] + ':' + match[3]);
				}
			}

			return result;
		},

		
		opera10a: function(e) {
			var ANON = '{anonymous}', lineRE = /Line (\d+).*script (?:in )?(\S+)(?:: In function (\S+))?$/i;
			var lines = e.stacktrace.split('\n'), result = [];

			for (var i = 0, len = lines.length; i < len; i += 2) {
				var match = lineRE.exec(lines[i]);
				if (match) {
					var fnName = match[3] || ANON;
					result.push(fnName + '()@' + match[2] + ':' + match[1] + ' -- ' + lines[i + 1].replace(/^\s+/, ''));
				}
			}

			return result;
		},

		
		opera9: function(e) {
			var ANON = '{anonymous}', lineRE = /Line (\d+).*script (?:in )?(\S+)/i;
			var lines = e.message.split('\n'), result = [];

			for (var i = 2, len = lines.length; i < len; i += 2) {
				var match = lineRE.exec(lines[i]);
				if (match) {
					result.push(ANON + '()@' + match[2] + ':' + match[1] + ' -- ' + lines[i + 1].replace(/^\s+/, ''));
				}
			}

			return result;
		},

		// Safari 5-, IE 9-, and others
		other: function(curr) {
			var ANON = '{anonymous}', fnRE = /function\s*([\w\-$]+)?\s*\(/i, stack = [], fn, args, maxStackSize = 10;
			while (curr && curr['arguments'] && stack.length < maxStackSize) {
				fn = fnRE.test(curr.toString()) ? RegExp.$1 || ANON : ANON;
				args = Array.prototype.slice.call(curr['arguments'] || []);
				stack[stack.length] = fn + '(' + this.stringifyArguments(args) + ')';
				curr = curr.caller;
			}
			return stack;
		},

		stringifyArguments: function(args) {
			var result = [];
			var slice = Array.prototype.slice;
			for (var i = 0; i < args.length; ++i) {
				var arg = args[i];
				if (arg === undefined) {
					result[i] = 'undefined';
				} else if (arg === null) {
					result[i] = 'null';
				} else if (arg.constructor) {
					if (arg.constructor === Array) {
						if (arg.length < 3) {
							result[i] = '[' + this.stringifyArguments(arg) + ']';
						} else {
							result[i] = '[' + this.stringifyArguments(slice.call(arg, 0, 1)) + '...' + this.stringifyArguments(slice.call(arg, -1)) + ']';
						}
					} else if (arg.constructor === Object) {
						result[i] = '#object';
					} else if (arg.constructor === Function) {
						result[i] = '#function';
					} else if (arg.constructor === String) {
						result[i] = '"' + arg + '"';
					} else if (arg.constructor === Number) {
						result[i] = arg;
					}
				}
			}
			return result.join(',');
		},

		sourceCache: {},
		
	
		isSameDomain: function(url) {
			return typeof location !== "undefined" && url.indexOf(location.hostname) !== -1; // location may not be defined, e.g. when running from nodejs.
		},

		
		getSource: function(url) {
			
			if (!(url in this.sourceCache)) {
				this.sourceCache[url] = this.ajax(url).split('\n');
			}
			return this.sourceCache[url];
		},

		guessAnonymousFunctions: function(stack) {
			for (var i = 0; i < stack.length; ++i) {
				var reStack = /\{anonymous\}\(.*\)@(.*)/,
					reRef = /^(.*?)(?::(\d+))(?::(\d+))?(?: -- .+)?$/,
					frame = stack[i], ref = reStack.exec(frame);

				if (ref) {
					var m = reRef.exec(ref[1]);
					if (m) { // If falsey, we did not get any file/line information
						var file = m[1], lineno = m[2], charno = m[3] || 0;
						if (file && this.isSameDomain(file) && lineno) {
							var functionName = this.guessAnonymousFunction(file, lineno, charno);
							stack[i] = frame.replace('{anonymous}', functionName);
						}
					}
				}
			}
			return stack;
		},

		guessAnonymousFunction: function(url, lineNo, charNo) {
			var ret;
			try {
				ret = this.findFunctionName(this.getSource(url), lineNo);
			} catch (e) {
				
				ret = 'getSource failed with url: ' + url + ', exception: ' + e.toString();
			}
			return ret;
		},

		findFunctionName: function(source, lineNo) {
			
			var reFunctionDeclaration = /function\s+([^(]*?)\s*\(([^)]*)\)/;
			var reFunctionExpression = /['"]?([$_A-Za-z][$_A-Za-z0-9]*)['"]?\s*[:=]\s*function\b/;
			
			var reFunctionEvaluation = /['"]?([$_A-Za-z][$_A-Za-z0-9]*)['"]?\s*[:=]\s*(?:eval|new Function)\b/;
			
			var code = "", line, maxLines = Math.min(lineNo, 20), m, commentPos;
			for (var i = 0; i < maxLines; ++i) {
			
				line = source[lineNo - i - 1];
				commentPos = line.indexOf('//');
				if (commentPos >= 0) {
					line = line.substr(0, commentPos);
				}
			if (line) {
					code = line + code;
					m = reFunctionExpression.exec(code);
					if (m && m[1]) {
						return m[1];
					}
					m = reFunctionDeclaration.exec(code);
					if (m && m[1]) {
						return m[1];
					}
					m = reFunctionEvaluation.exec(code);
					if (m && m[1]) {
						return m[1];
					}
				}
			}
			return '(?)';
		}
	};
  }


}
