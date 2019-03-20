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


export function copyToClipboard(elem) {
	// create hidden text element, if it doesn't already exist
	var targetId = "_hiddenCopyText_";
	var isInput = elem.tagName === "INPUT" || elem.tagName === "TEXTAREA";
	var origSelectionStart, origSelectionEnd;
	if (isInput) {
		// can just use the original source element for the selection and copy
		target = elem;
		origSelectionStart = elem.selectionStart;
		origSelectionEnd = elem.selectionEnd;
	} else {
		// must use a temporary form element for the selection and copy
		target = document.getElementById(targetId);
		if (!target) {
			var target = document.createElement("textarea");
			target.style.position = "absolute";
			target.style.left = "-9999px";
			target.style.top = "0";
			target.id = targetId;
			document.body.appendChild(target);
		}
		target.textContent = elem.textContent;
	}
	// select the content
	var currentFocus = document.activeElement;
	target.focus();
	target.setSelectionRange(0, target.value.length);

	// copy the selection
	var succeed;
	try {
		succeed = document.execCommand("copy");
	} catch(e) {
		succeed = false;
	}
	// restore original focus
	if (currentFocus && typeof currentFocus.focus === "function") {
		currentFocus.focus();
	}

	if (isInput) {
		// restore prior selection
		elem.setSelectionRange(origSelectionStart, origSelectionEnd);
	} else {
		// clear temporary content
		target.textContent = "";
	}
	return succeed;
}

export function getDeepProp(object, path) {
	const p = path.split('.');
	return p.reduce((xs, x) => (xs && xs[x] !== undefined) ? xs[x] : undefined, object)
}