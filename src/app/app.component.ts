import {  ErrorHandler, Injectable,Component, NgModule } from '@angular/core';
import { setDefaultService } from "selenium-webdriver/chrome";
import { OnInit } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { browser } from 'protractor';
import { version } from 'punycode';


@Injectable()
export class CustomErrorHandler implements ErrorHandler {
  constructor() { }
  handleError(error) {
    // your custom error handling logic
   // console.log("hi");
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
	[x: string]: any;

  title = 'app';
  s: string = "Hello2";
  errorString:string="";
   http1:any
 constructor(private _http:HttpClient)
 {
  this.http1=this._http;

 }

ngOnInit(): void {
    let http2=this._http;
   // console.log(this.s) 
  	var debugMode = true;
	  var logErrorURL = "https://localhost:44343/api/ErrorLog/";
    var Options;
	  window.onerror = function(msg, url, lineNum) {
		var stackTraceInfo = printStackTrace(Options);
		var OS = findbrowser(window);
		var errorInfo = {
			url:        url,
			lineNum:    lineNum,
			stackTrace: stackTraceInfo.stackTrace,
			operatingsystem: OS,
     // browser:    stackTraceInfo.browser
    };
    //console.log(stackTraceInfo.stackTrace);
    logError(logErrorURL,JSON.stringify(errorInfo),http2);
  };

    function logError(url, postData,obj) {
		errorLog(url,postData,obj).subscribe(response=>{
			if(response=="success"){
				//console.log("congo");
			}
		})
	}
  	 function errorLog(url, body,obj):Observable<any>{
     body=JSON.stringify(body);  
		 let headers={'Content-Type':'application/json','Host': 'localhost','Accept': '*/*'}
		 const httpOptions={
             headers:headers,
		 }
		return obj.post(url,body,httpOptions);
	}
  

	function printStackTrace(options)
	{
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
			}
			// else if (typeof e.message === 'string' && typeof window !== 'undefined' ) {
			
			// 	if (!e.stacktrace) {
            //         return 'opera9'; 
            //     	}
			// 	// 'opera#sourceloc' in e -> opera9, opera10a
			// 	if (e.message.indexOf('\n') > -1 && e.message.split('\n').length > e.stacktrace.split('\n').length) {
			// 		return 'opera9'; 
			// 	}
			// 	// e.stacktrace && !e.stack -> opera10a
			// 	if (!e.stack) {
			// 		return 'opera10a'; // use e.stacktrace
			// 	}
			// 	// e.stacktrace && e.stack -> opera10b
			// 	if (e.stacktrace.indexOf("called from line") < 0) {
			// 		return 'opera10b'; // use e.stacktrace, format differs from 'opera10a'
			// 	}
			// 	// e.stacktrace && e.stack -> opera11
			// 	return 'opera11'; // use e.stacktrace, format differs from 'opera10a', 'opera10b'
			// } 
			else if (e.stack) {
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
	}
	
	function findbrowser(window)
	{var unknown = '-';
  
	// screen
	var screenSize = '';
	if (screen.width) {
	   var width = (screen.width) ? screen.width : '';
	   var height = (screen.height) ? screen.height : '';
		screenSize += '' + width + " x " + height;
	}
  
	// browser
	var nVer = navigator.appVersion;
	var nAgt = navigator.userAgent;
	var browser = navigator.appName;
	var version = '' + parseFloat(navigator.appVersion);
	var majorVersion = parseInt(navigator.appVersion, 10);
	var nameOffset, verOffset, ix;
  
	// Opera
	if ((verOffset = nAgt.indexOf('Opera')) != -1) {
		browser = 'Opera';
		version = nAgt.substring(verOffset + 6);
		if ((verOffset = nAgt.indexOf('Version')) != -1) {
			version = nAgt.substring(verOffset + 8);
		}
	}
	// Opera Next
	if ((verOffset = nAgt.indexOf('OPR')) != -1) {
		browser = 'Opera';
		version = nAgt.substring(verOffset + 4);
	}
	// Edge
	else if ((verOffset = nAgt.indexOf('Edge')) != -1) {
		browser = 'Microsoft Edge';
		version = nAgt.substring(verOffset + 5);
	}
	// MSIE
	else if ((verOffset = nAgt.indexOf('MSIE')) != -1) {
		browser = 'Microsoft Internet Explorer';
		version = nAgt.substring(verOffset + 5);
	}
	// Chrome
	else if ((verOffset = nAgt.indexOf('Chrome')) != -1) {
		browser = 'Chrome';
		version = nAgt.substring(verOffset + 7);
	}
	// Safari
	else if ((verOffset = nAgt.indexOf('Safari')) != -1) {
		browser = 'Safari';
		version = nAgt.substring(verOffset + 7);
		if ((verOffset = nAgt.indexOf('Version')) != -1) {
			version = nAgt.substring(verOffset + 8);
		}
	}
	// Firefox
	else if ((verOffset = nAgt.indexOf('Firefox')) != -1) {
		browser = 'Firefox';
		version = nAgt.substring(verOffset + 8);
	}
	// MSIE 11+
	else if (nAgt.indexOf('Trident/') != -1) {
		browser = 'Microsoft Internet Explorer';
		version = nAgt.substring(nAgt.indexOf('rv:') + 3);
	}
	// Other browsers
	else if ((nameOffset = nAgt.lastIndexOf(' ') + 1) < (verOffset = nAgt.lastIndexOf('/'))) {
		browser = nAgt.substring(nameOffset, verOffset);
		version = nAgt.substring(verOffset + 1);
		if (browser.toLowerCase() == browser.toUpperCase()) {
			browser = navigator.appName;
		}
	}
	// trim the version string
	if ((ix = version.indexOf(';')) != -1) version = version.substring(0, ix);
	if ((ix = version.indexOf(' ')) != -1) version = version.substring(0, ix);
	if ((ix = version.indexOf(')')) != -1) version = version.substring(0, ix);
  
	majorVersion = parseInt('' + version, 10);
	if (isNaN(majorVersion)) {
		version = '' + parseFloat(navigator.appVersion);
		majorVersion = parseInt(navigator.appVersion, 10);
	}
  
	// mobile version
	var mobile = /Mobile|mini|Fennec|Android|iP(ad|od|hone)/.test(nVer);
  
	// cookie
	var cookieEnabled = (navigator.cookieEnabled) ? true : false;
  
	if (typeof navigator.cookieEnabled == 'undefined' && !cookieEnabled) {
		document.cookie = 'testcookie';
		cookieEnabled = (document.cookie.indexOf('testcookie') != -1) ? true : false;
	}
  
	// system
	var os = unknown;
	var clientStrings = [
		{s:'Windows 10', r:/(Windows 10.0|Windows NT 10.0)/},
		{s:'Windows 8.1', r:/(Windows 8.1|Windows NT 6.3)/},
		{s:'Windows 8', r:/(Windows 8|Windows NT 6.2)/},
		{s:'Windows 7', r:/(Windows 7|Windows NT 6.1)/},
		{s:'Windows Vista', r:/Windows NT 6.0/},
		{s:'Windows Server 2003', r:/Windows NT 5.2/},
		{s:'Windows XP', r:/(Windows NT 5.1|Windows XP)/},
		{s:'Windows 2000', r:/(Windows NT 5.0|Windows 2000)/},
		{s:'Windows ME', r:/(Win 9x 4.90|Windows ME)/},
		{s:'Windows 98', r:/(Windows 98|Win98)/},
		{s:'Windows 95', r:/(Windows 95|Win95|Windows_95)/},
		{s:'Windows NT 4.0', r:/(Windows NT 4.0|WinNT4.0|WinNT|Windows NT)/},
		{s:'Windows CE', r:/Windows CE/},
		{s:'Windows 3.11', r:/Win16/},
		{s:'Android', r:/Android/},
		{s:'Open BSD', r:/OpenBSD/},
		{s:'Sun OS', r:/SunOS/},
		{s:'Linux', r:/(Linux|X11)/},
		{s:'iOS', r:/(iPhone|iPad|iPod)/},
		{s:'Mac OS X', r:/Mac OS X/},
		{s:'Mac OS', r:/(MacPPC|MacIntel|Mac_PowerPC|Macintosh)/},
		{s:'QNX', r:/QNX/},
		{s:'UNIX', r:/UNIX/},
		{s:'BeOS', r:/BeOS/},
		{s:'OS/2', r:/OS\/2/},
		{s:'Search Bot', r:/(nuhk|Googlebot|Yammybot|Openbot|Slurp|MSNBot|Ask Jeeves\/Teoma|ia_archiver)/}
	];
	for (var id in clientStrings) {
		var cs = clientStrings[id];
		if (cs.r.test(nAgt)) {
			os = cs.s;
			break;
		}
	}
	
	var osVersion = unknown;
  
	if (/Windows/.test(os)) {
		osVersion = /Windows (.*)/.exec(os)[1];
		os = 'Windows';
	}
  
	switch (os) {
		case 'Mac OS X':
			osVersion = /Mac OS X (10[\.\_\d]+)/.exec(nAgt)[1];
			break;
  
		case 'Android':
			osVersion = /Android ([\.\_\d]+)/.exec(nAgt)[1];
			break;
  
		case 'iOS':
			this.osVersion = /OS (\d+)_(\d+)_?(\d+)?/.exec(nVer);
			osVersion = osVersion[1] + '.' + osVersion[2] + '.' + (this.osVersion[3] | 0);
			break;
	}
	
	// flash (you'll need to include swfobject)
	/* script src="//ajax.googleapis.com/ajax/libs/swfobject/2.2/swfobject.js" */
	//var flashVersion = 'no check';
	// if (typeof this.swfobject != 'undefined') {
	// 	var fv = this.swfobject.getFlashPlayerVersion();
	// 	if (fv.major > 0) {
	// 		flashVersion = fv.major + '.' + fv.minor + ' r' + fv.release;
	// 	}
	// 	else  {
	// 		flashVersion = unknown;
	// 	}
	// }
	return  browser+" "+majorVersion;
  }
  
  // window.jscd = {
  //   screen: this.screenSize,
  //   browser: browser,
  //   browserVersion: version,
  //   browserMajorVersion: this.majorVersion,
  //   mobile: this.mobile,
  //   os: this.os,
  //   osVersion: this.osVersion,
  //   cookies: this.cookieEnabled,
  //   flashVersion: this.flashVersion
  // };
  
}
}
  

