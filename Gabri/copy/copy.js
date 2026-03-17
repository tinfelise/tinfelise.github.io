function count (element) {
	var string = element.value
	var characters = string.length;
	var whitespaces = /\s+/i;
	var words = string.split(whitespaces).filter(word => word.length > 0).length;
	$('#characters').html(characters);
	$('#words').html(words);
};

function copy_input (element) {
	$(element).select(); //works on Chrome
	$(element).get(0).setSelectionRange(0,9999); //works on iOS Safari
	document.execCommand('copy');
};
function copy_div (element) {
	var text = $(element).text();
	var targetID = "hiddenCopyText";
	var targetSelector = '#' + targetID;
	var target = $(targetSelector);
	if ( target.length == 0) {
		target = document.createElement("textarea");
		target.style.position = "absolute";
		target.style.left = "-9999px";
		target.style.top = "0";
		target.id = targetID;
		document.body.appendChild(target);
		target.textContent = text;
	} else {
		target.text(text);
	};
	copy_input(targetSelector);
};

function save_html (text, id) {
	var html = '<p>' + text + '</p>';
		html += '<a class="action instagramGradient gradientFont" onclick="bye(\'#saved' + id + '\')">Remove</a>';
		html += '<a class="action instagramGradient gradientFont" onclick="copy_div(\'#saved' + id + ' p\')">Copy</a>';
		html = '<div data-save-id=\'' + id + '\' id="saved' + id + '">' + html + '</div>';
	return html;
};

function save (textarea) {
	var text = $(textarea).val();
	var saved = addEntry('saved', text);
	var output = save_html (text, saved);
	$('#saved').append(output);
	clear_all_state();
	$(textarea).select();
};
$('textarea').keypress(function (e) {
    if(e.which === 13 && e.shiftKey) {
        e.preventDefault();
        save("textarea");
    }
});

function addEntry (obj, val) {
	// Parse any JSON previously stored in allEntries
	var allEntries = JSON.parse(localStorage.getItem(obj)) || [];
	allEntries.push(val);
	var id = allEntries.length;
	// Save allEntries back to local storage
	localStorage.setItem(obj, JSON.stringify(allEntries));
	return id;
};

function removeEntry (obj, id) {
	var allEntries = JSON.parse(localStorage.getItem(obj)) || [];
	delete allEntries[id];
	localStorage.setItem(obj, JSON.stringify(allEntries));
};

function bye (element) {
	var id = element.split('#saved')[1] - 1;
	removeEntry ('saved', id);
	$(element).remove();
	clear_all_state();
};

function clear_saved () {
	$('#saved div').remove();
	localStorage.clear('saved');
	$('#saved .clear').removeClass('show_clear');
};

function clear_all_state () {
	var saved = $('#saved div').length;
	if (saved == 1) {
		$('#saved .clear').addClass('show_clear');
		$('#saved .clear').addClass('disabled');
	} else if (saved > 1) {
		$('#saved .clear').addClass('show_clear');
		$('#saved .clear').removeClass('disabled');
	} else {
		$('#saved .clear').removeClass('show_clear');
	};
};

function add_from_local () {
	var allEntries = JSON.parse(localStorage.getItem('saved')) || [];
	for (i in allEntries) {
		var id = i;
		var text = allEntries[i];
		if (text) {
			var output = save_html (text, id);
			$('#saved').append(output);
		};
	};
	clear_all_state();
	$('textarea').select();
};
add_from_local();