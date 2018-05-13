function validator(data) {
	var debug = data.debug || false;
	var btn = data.el;
	var f = (data.form == null) ? btn.parents("form") : data.form;
	var callback = (data.callback !== undefined) ? data.callback : '';
	var showErrorFunction = (data.showErrorFunction !== undefined) ? data.showErrorFunction : '';
	var showErrorMode = (data.showErrorMode !== undefined) ? data.showErrorMode : 'normal';
	var errorTag = (data.errorTag !== undefined) ? data.errorTag : 'em';
	var errorClass = (data.errorClass !== undefined) ? data.errorClass : 'has-error';
	var useBootstrapError = (data.useBootstrapError !== undefined) ? data.useBootstrapError : 'false';
	var useBootstrapDialog = (data.useBootstrapDialog !== undefined) ? data.useBootstrapDialog : 'false';
	var defaults = $("[placeholder]", f);
	var fields = $(":input", f).not(':submit, :button, :reset, input:hidden');
	if (debug) {
		console.log(data);
		console.log(fields);
	}
	var er_email = /^\w+([\.-]?\w+)*@\w+([\.-]?\w+)*(\.\w{2,4})+$/;
	var er_numeric = /^\d+$/;
	var nl = '<br>';
	var send = true;
	var errors = new Array();
	var messages = '';
	var validationRegEx = new RegExp("validate\:(\{.*\})", "i");
	var getFieldRules = function (f) {
		var dataPosition = (f.attr('class') !== undefined) ? f.attr('class').search(validationRegEx) : -1;
		var validationRules = (f.attr('class') !== undefined && dataPosition != -1) ? f.attr('class').match(validationRegEx) : '';
		var data = (validationRules[1]) ? eval('(' + validationRules[1] + ')') : '';
		return data;
	};
	fields.each(function (i) {
		var tagName = this.tagName.toLowerCase();
		var type = (tagName == 'select') ? 'select' : ((tagName == 'textarea') ? 'textarea' : $(this).attr('type'));
		var pHolder = ($(this).attr('placeholder') !== undefined) ? $(this).attr('placeholder') : '';
		var data = getFieldRules($(this));
		var isRequired = ($(this).hasClass('required') || (data.required !== undefined && data.required == true)) ? true : false;
		var isEmail = ($(this).hasClass('email') || (data.email !== undefined && data.email == true)) ? true : false;
		var isNumeric = ($(this).hasClass('numeric') || (data.numeric !== undefined && data.numeric == true)) ? true : false;
		var minlength = (data.minlength !== undefined) ? data.minlength : false;
		var maxlength = (data.maxlength !== undefined) ? data.maxlength : false;
		var match = (data.match !== undefined && data.match !== false) ? data.match : '';
		var fieldName = (data.fieldname !== undefined && data.fieldname !== false) ? data.fieldname : thisField;
		var error = new Array();
		var m = '';
		var addField = false;
		if (debug) {
			console.log(data);
		}
		if (data) {
			$(this).attr('fieldName', fieldName);
			switch (type) {
				case 'select':
					if (isRequired && $(this).val() == '') {
						m = msgRequired.replace('{fieldName}', fieldName) + nl;
						addField = true;
					}
					if (minlength && minlength > 0) {
						if ($(this).find('option:selected').length < minlength) {
							m += msgMinlength.replace('{fieldName}', fieldName).replace('{minlength}', minlength).replace('{objects}', comboOption) + nl;
							addField = true;
						}
					}
					if (maxlength && maxlength > 0) {
						if ($(this).find('option:selected').length > maxlength) {
							m += msgMaxlength.replace('{fieldName}', fieldName).replace('{maxlength}', maxlength).replace('{objects}', comboOptions) + nl;
							addField = true;
						}
					}
					break;
				case 'text':
				case 'password':
				case 'textarea':
					if ((isRequired && ((pHolder == $(this).val()) || (isRequired && $(this).val() == ''))) || (isRequired && (type == 'textarea') && $(this).val() == '')) {
						m = msgRequired.replace('{fieldName}', fieldName) + nl;
						addField = true;
					}
					if (isEmail && !er_email.test($(this).val())) {
						m += msgEmail.replace('{fieldName}', fieldName) + nl;
						addField = true;
					}
					if (isNumeric && !er_numeric.test($(this).val()) && $(this).val() != '') {
						m += msgNumeric.replace('{fieldName}', fieldName) + nl;
						addField = true;
					}
					if (minlength && minlength > 0) {
						if ($(this).val().length < minlength) {
							m += msgMinlength.replace('{fieldName}', fieldName).replace('{minlength}', minlength).replace('{objects}', characters) + nl;
							addField = true;
						}
					}
					if (match && ($(this).val() != $('#' + match).val())) {
						var d = getFieldRules($('#' + match));
						var tmpFieldName = (d.fieldname != undefined) ? d.fieldname : $('#' + match).attr('id');
						m += msgMatch.replace('{source}', tmpFieldName).replace('{match}', fieldName) + nl;
						addField = true;
					}
					break;
				case 'radio':
					var radio = $('[name="' + $(this).attr('name') + '"]:checked');
					if (isRequired && radio.length < 1) {
						m = msgRequired.replace('{fieldName}', fieldName) + nl;
						addField = true;
					}
					break;
				case 'checkbox':
					if (isRequired && !$(this).is(':checked')) {
						m = msgRequired.replace('{fieldName}', fieldName) + nl;
						addField = true;
					}
					break;
			}
			if (addField) {
				error.push({
					field: $(this),
					msg: m
				});
				errors.push(error);
			}
		}
	});
	if (errors.length > 0) {
		send = false;
		switch (showErrorMode) {
			case 'custom':
				if (!showErrorFunction) {
					alert(errorFunctionNotDefined);
					return;
				}
				$(errorTag + '.' + errorClass).remove();
				$(errors).each(function (i) {
					var element = $(this).get(0).field;
					console.log('element fieldname: ' + element.attr('fieldName'));
					var pattern = new RegExp(element.attr('fieldName'), 'g');
					console.log('pattern: ' + pattern);
					var outputMsg = (pattern === undefined) ? $(this).get(0).msg.replace(thisField, thisField) : $(this).get(0).msg;
					console.log('outputMsg: ' + outputMsg + ' ' + thisField);
					var tag = $('<' + errorTag + '>').addClass(errorClass).html(outputMsg.replace(/<strong>/g, '').replace(/<\/strong>/g, ''));
					if (element.is(':radio')) {
						$("input[name='" + element.attr('name') + "']").bind('focus click keydown', function () {
							tag.remove();
						});
					} else {
						element.bind('focus click keydown', function () {
							tag.remove();
						});
					}
					showErrorFunction(tag, element);
				});
				break;
			case 'normal':
			case 'dialog':
				$(errors).each(function (i) {
					var element = $(this).get(0).field;
					var elementContainer = $(this).get(0).field.parent();
					if (!useBootstrapError) {
						element.addClass(errorClass);
						element.bind('focus click', function () {
							$(this).removeClass(errorClass);
						});
					} else {
						elementContainer.addClass(errorClass);
						element.bind('focus click', function () {
							elementContainer.removeClass(errorClass);
							if (element[0].type == 'radio') {
								$('[name="' + element[0].name + '"]').parent().removeClass(errorClass);
							}
						});
					}
					messages += $(this).get(0).msg;
				});
				if (showErrorMode == 'dialog') {
					if (!useBootstrapDialog) {
						dialog({
							'title': dialogErrorTitle,
							'message': messages,
							'icon': 'error',
							'width': 350,
							'modal': true
						});
					} else {
						bootstrpDialog({
							'title': dialogErrorTitle,
							'message': messages,
							'fullwidth': false,
							'size': 'regular'
						});
					}
				}
				break;
		}
	} else {
		if (callback != '') {
			callback();
		}
	}
	if (debug) {
		console.log('validator send: ' + send);
		return false;
	} else {
		return send;
	}
}
