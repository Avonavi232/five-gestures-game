export function parse_query_string(query) {
	var vars = query.slice(1).split("&");
	var query_string = {};
	for (var i = 0; i < vars.length; i++) {
		var pair = vars[i].split("=");
		// If first entry with this name
		if (typeof query_string[pair[0]] === "undefined") {
			query_string[pair[0]] = decodeURIComponent(pair[1]);
			// If second entry with this name
		} else if (typeof query_string[pair[0]] === "string") {
			var arr = [query_string[pair[0]], decodeURIComponent(pair[1])];
			query_string[pair[0]] = arr;
			// If third or later entry with this name
		} else {
			query_string[pair[0]].push(decodeURIComponent(pair[1]));
		}
	}
	return query_string;
}

/**
 * util func searches Node with className in path
 * @param className {string}
 * @param path {array}
 * @return {node}
 */
export function findTargetInPath(className, path) {
    for (const curr of path) {
        if (curr.classList.contains(className)) {
            return curr;
        } else if (curr.tagName === 'BODY') {
            return null;
        }
    }
}


/**
 * util func creates composedPath, if the browser do not support event.path
 * @param el {node}
 * @return {array}
 */
export function composedPath(el) {
    const path = [];
    while (el) {
        path.push(el);
        if (el.tagName === 'HTML') {
            path.push(document);
            path.push(window);
            return path;
        }
        el = el.parentElement;
    }
}


/**
 * util func returns event.path, if it is supported by browser ore creates it with composedPath func
 * @param event {Event}
 * @return {Array}
 */
export function getComposedPath(event) {
    return event.path || (event.composedPath && event.composedPath()) || composedPath(event.target);
}