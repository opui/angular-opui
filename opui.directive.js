/**
 * CMSZ前端UI整合框架，angularjs指令版
 * @version v0.1.0
 * @author 运维运营前端组
 * @license MIT License, http://www.opensource.org/licenses/MI
 */
angular.module('angular-opui', ['ng', 'restangular', 'opui.core', 'opui.form', 'opui.table', 'opui.charts']);
(function () {
    'use strict';
    /**
     * 自定义核心模块
     * @module opui.core
     * @desc 
     * 时间控件
     * 提示信息等
     */
    var opuiModule = angular.module('opui.core', ['ng', 'restangular']);
    
    //时间限制
    opuiModule.directive('opMindate', ['$parse', function($parse) {
            'use strict';
            return {
                link: function(scope, element, attrs) {
                    var minDateGetter = $parse(attrs.opMindate);
                    var minDateSetter = minDateGetter.assign;
                    var timeGetter = $parse($('[opdatepicker=' + attrs.opMindate + ']').attr('ng-model'));
                    var timeSetter = timeGetter.assign;
                    var dayLength = attrs.dayLength;
                    scope.$watch(attrs.ngModel, function(value) {
                        if (value === undefined || value === null || value === '') return;
                        var timepicker = minDateGetter(scope);
                        var maxTime = timeGetter(scope);
                        timepicker.minDate = value;
                        minDateSetter(scope, timepicker);
                        if (value > maxTime) {
                            timeSetter(scope, value);
                        } else if (dayLength && value.length > 7) {
                            var afterDate31 = new Date(Date.parse(value) + 86400000 * dayLength).format('yyyy-MM-dd');
                            if (maxTime > afterDate31) {
                                //scope.setNoticeMsg('只能查询'+dayLength+'天内的数据！');
                                timeSetter(scope, afterDate31);
                            }
                        }
                    });
                }
            };
        }])
        .directive('opMaxdate', ['$parse', function($parse) {
            'use strict';
            return {
                link: function(scope, element, attrs) {
                    var maxDateGetter = $parse(attrs.opMaxdate);
                    var maxDateSetter = maxDateGetter.assign;
                    var timeGetter = $parse($('[opdatepicker=' + attrs.opMaxdate + ']').attr('ng-model'));
                    var timeSetter = timeGetter.assign;
                    var dayLength = attrs.dayLength;
                    scope.$watch(attrs.ngModel, function(value) {
                        if (value === undefined || value === null || value === '') return;
                        var timepicker = maxDateGetter(scope);
                        var minTime = timeGetter(scope);
                        var year = value.substring(0, 4);
                        var month = value.substring(5, 7);
                        var day = value.substring(8, 10);
                        var date = new Date(year, parseInt(month) - 1, parseInt(day) - 1).Format('yyyy-MM-dd');
                        if (attrs.reduceOne == 'y')
                            timepicker.maxDate = date;
                        else
                            timepicker.maxDate = value;
                        maxDateSetter(scope, timepicker);
                        if (value <= minTime) {
                            if (attrs.reduceOne == 'y')
                                timeSetter(scope, date);
                            else
                                timeSetter(scope, value);

                        } else if (dayLength && value.length > 7) {
                            var beforeDate31 = new Date(Date.parse(value) - 86400000 * dayLength).format('yyyy-MM-dd');
                            if (minTime < beforeDate31) {
                                //scope.setNoticeMsg('只能查询'+dayLength+'天内的数据！');
                                timeSetter(scope, beforeDate31);
                            }
                        }
                    });
                }
            };
        }]);
})();
(function () {
    'use strict';
    /**
     *  表单模块
     *  @module opui.form
     *  @desc 表单验证：特殊字符验证、数据库重复验证、正则表达式验证
     *  还有其他自定义验证
     */
    angular.module('opui.form', ['ng', 'restangular']);
    
    //输入Enter查询
    angular.module('opui.form').directive('opEnter', ['$parse', function($parse) {
        'use strict';
        return {
            link: function(scope, element, attrs, ctrl) {
                var getter = $parse(attrs.opEnter);
                element.bind('keydown', function(event) {
                    if (event.keyCode === 13) {
                        getter(scope);
                    }
                });
            }
        };
    }])

    //长度限制
    .directive('opLength', ['$parse', function($parse) {
        'use strict';
        return {
            link: function(scope, element, attrs) {
                var getter = $parse(attrs.ngModel);
                var setter = getter.assign;
                var length = $parse(attrs.opLength)(scope);
                scope.$watch(attrs.ngModel, function(value, oldValue) {
                    if (value === undefined) return;
                    value = '' + value;
                    if (value.length > length) {
                        scope.setNoticeMsg('输入字符不能超过限制长度' + length + '！');
                        setter(scope, oldValue);
                    }
                });
            }
        };
    }])

    //特殊字符验证
    .directive('opSpecial', ['$compile', function($compile) {
        'use strict';
        return {
            require: 'ngModel',
            link: function(scope, element, attrs, ctrl) {
                var showMsg = attrs.showMsg;
                scope.$watch(attrs.ngModel, function(value) {
                    if (element.val() === '') return;
                    if (SPECIAL_REGEXP_S.test(value)) {
                        if (showMsg) element.attr('show-msg', showMsg);
                        element[0].setCustomValidity('');
                        ctrl.$setValidity('speString', true);
                        element.popover('hide');
                    } else {
                        if (showMsg) element.attr('show-msg', '不允许输入特殊字符！');
                        element[0].setCustomValidity('不允许输入特殊字符');
                        ctrl.$setValidity('speString', false);
                        element.popover('show');
                    }
                });
            }
        };
    }])

    //重名验证
    .directive('opValidate', ['Restangular', function(Restangular) {
        'use strict';
        return {
            require: 'ngModel',
            compile: function($element, attr) {
                var showMsg = attr.showMsg;
                var showName = attr.showName;
                var url = config.get(attr.opValidate);
                return function(scope, element, attrs, ctrl) {
                    element.bind('blur', function() {
                        //空字符或含有特殊字符的不验证
                        var mm = element[0].validationMessage;
                        if (element.val() === '' || mm === '不允许输入特殊字符' || mm === '请与所请求的格式保持一致。' || mm === '你必须使用此格式: ' || mm === '请匹配要求的格式。') return;
                        //修改时等于原值的不验证
                        if (attrs.oldName && element.val() === attrs.oldName) return;
                        /**
                         * 设置验证等待中。
                         */
                        if (showMsg) element.attr('show-msg', '数据库验证中！');
                        element[0].setCustomValidity('数据库验证中');
                        element.css('color', '#000');
                        element.popover('show');

                        /**
                         * 开始验证
                         */
                        Restangular.all(url).post(element.val()).then(function(response) {
                            if (response.success && response.data) {
                                if (showMsg) element.attr('show-msg', '此名称已存在，请重新输入！');
                                if (showName) element.attr('show-msg', '此' + showName + '已存在，请重新输入！');
                                element[0].setCustomValidity('此名称已存在，请重新输入');
                                element.css('color', 'red');
                                ctrl.$setValidity('unique', false);
                                element.popover('show');
                            } else {
                                if (showMsg) element.attr('show-msg', '该名称可用！');
                                if (showName) element.attr('show-msg', '该' + showName + '可用！');
                                element[0].setCustomValidity('该名称可用');
                                element.popover('show');
                                element.css('color', 'green');
                                ctrl.$setValidity('unique', true);
                                if (showMsg) element.attr('show-msg', showMsg);
                                element[0].setCustomValidity('');
                            }
                        });
                    });
                };
            }
        };
    }])

    //表单验证第4版本，bootstap版
    .directive('opSave', ['$parse', '$timeout', function($parse, $timeout) {
        'use strict';
        return {
            link: function(scope, element, attrs) {
                var beforeTodo = attrs.beforeSave; //验证之前处理的函数
                var toDoGetter = $parse(attrs.opSave);
                var formName = attrs.formName || 'form';
                var errorName = formName + '.$error';
                var form = $('[name=' + formName + ']')[0];

                /**
                 * 用于处理重复提交
                 * 使用定时器，1秒之后才能再次提交
                 */
                var submitTimer;

                /**
                 * 初始化提示控件
                 * 可以自定义提示，如果没有就使用浏览器默认提示
                 */
                $('form input, select, textarea').each(function() {
                    if (!this.required) return;
                    $(this).popover({
                        trigger: 'click hover',
                        placement: 'top',
                        content: function() {
                            var _this = $(this);
                            if (this.validationMessage != '') {
                                return _this.attr('show-msg') || this.validationMessage;
                            }
                            return '';
                        }
                    }).on('shown.bs.popover', function() {
                        var _this = $(this);
                        if (_this.data('toId')) {
                            clearTimeout(_this.data('toId'));
                        }
                        var toId = setTimeout(function() {
                            _this.popover('hide');
                        }, 3000);
                        _this.data('toId', toId);
                    });
                });

                /**
                 * 用于输入时验证信息提示
                 */
                scope.$watch(errorName, function(errorArray, oldErrorArray) {
                    for (var type in oldErrorArray) {
                        console.log(type);
                        if (type != 'required') {
                            continue;
                        }
                        for (var index in oldErrorArray[type]) {
                            var errorObj = oldErrorArray[type][index];
                            var element = $('[name=' + errorObj.$name + ']');
                            if (errorObj.$dirty) {
                                element.popover('hide');
                            }
                        }
                    }
                    for (var type in errorArray) {
                        if (type != 'required') {
                            continue;
                        }
                        for (var index in errorArray[type]) {
                            var errorObj = errorArray[type][index];
                            var element = $('[name=' + errorObj.$name + ']');
                            if (errorObj.$dirty) {
                                element.popover('show');
                            }
                        }
                    }
                }, true);

                /**
                 * 绑定提交按钮
                 * 当提交时验证表单
                 * 只有全部通过之后才能执行相应的后续函数
                 */
                element.bind('click', function() {
                    //解决页面闪动问题
                    element.focus();
                    //判断是否在限制时间内
                    if (submitTimer) return;
                    //验证之前处理的函数
                    if (beforeTodo) $parse(beforeTodo)(scope);
                    //将验证通过的字段去掉显示
                    var validFields = $(':valid', form).each(function() {
                        $(this).popover('hide');
                    });
                    //将所有未验证通过的字段显示提示
                    var invalidFields = $(':invalid', form).each(function() {
                        $(this).popover('show');
                    });
                    //聚焦到第一个错误的输入框
                    if (invalidFields.length > 0) {
                        invalidFields.first().trigger('focus').eq(0).focus();
                        return;
                    }
                    //验证成功，继续下一步动作
                    scope.$apply(function() {
                        toDoGetter(scope);
                        /**
                         * 设置限定时间1s
                         */
                        submitTimer = $timeout(function() {
                            submitTimer = undefined;
                        }, 1000);
                    });
                });
            }
        };
    }])

    /*******************************************************
     * 
     * 第5版本指令
     * 
     * -----------------------------------------------------
     */
    .directive('opTodo', ['$parse', '$timeout', function($parse, $timeout) {
        'use strict';
        return {
            link: function(scope, element, attrs) {
                var toDoGetter = $parse(attrs.opTodo);
                var formName = attrs.formName;
                var formId = attrs.formId;
                var errorName = formName + '.$error';
                var form = formId ? $('#' + formId)[0] : $('form')[0];

                /**
                 * 用于处理重复提交
                 * 使用定时器，1秒之后才能再次提交
                 */
                var submitTimer;

                /**
                 * 初始化提示控件
                 * 可以自定义提示，如果没有就使用浏览器默认提示
                 */
                $('input, select, textarea', form).each(function() {
                    if (!this.required) {
                        if (this.outerHTML.indexOf('op-second') !== -1 || this.outerHTML.indexOf('op-special') !== -1) {} else return;
                    }
                    $(this).popover({
                        trigger: 'click hover',
                        placement: 'down',
                        template: '<div class="popover" style="border-radius:0;-webkit-border-radius: 0;-moz-border-radius: 0;border:0 solid red;margin-top:2px;min-width:100%;">' + '<div class="popover-content" style="padding:2px 5px;color:red;"></div>' + '</div>',
                        html: true,
                        content: function() {
                            var _this = $(this);
                            var icon = '<img src="images/op_info.png" alt=""/>&nbsp;';
                            if (this.validationMessage != '') {
                                return icon + (_this.attr('show-msg') || this.validationMessage);
                            }
                            if (this['readOnly'] && !this.value) {
                                return icon + '此项不能为空!';
                            }
                            return '';
                        }
                    }).on('shown.bs.popover', function() {
                        var _this = $(this);
                        if (_this.data('toId')) {
                            clearTimeout(_this.data('toId'));
                        }

                        //设置样式
                        //_this.css('border', '1px solid red');
                        var toId = setTimeout(function() {
                            _this.popover('hide');
                            //_this.css('border', '0');
                        }, 3000);
                        _this.data('toId', toId);
                    });
                });

                /**
                 * 用于输入时验证信息提示
                 */
                scope.$watch(errorName, function(errorArray, oldErrorArray) {
                    for (var type in oldErrorArray) {
                        console.log(type);
                        if (type != 'required') {
                            continue;
                        }
                        for (var index in oldErrorArray[type]) {
                            var errorObj = oldErrorArray[type][index];
                            var element = $('[name=' + errorObj.$name + ']');
                            if (errorObj.$dirty) {
                                element.popover('hide');
                            }
                        }
                    }
                    for (var type in errorArray) {
                        if (type != 'required') {
                            continue;
                        }
                        for (var index in errorArray[type]) {
                            var errorObj = errorArray[type][index];
                            var element = $('[name=' + errorObj.$name + ']');
                            if (errorObj.$dirty) {
                                element.popover('show');
                            }
                        }
                    }
                }, true);

                /**
                 * 绑定提交按钮
                 * 当提交时验证表单
                 * 只有全部通过之后才能执行相应的后续函数
                 */
                element.bind('click', function() {
                    //解决页面闪动问题
                    element.focus();
                    //判断是否在限制时间内
                    if (submitTimer) return;
                    //处理readOnly元素和空格问题
                    var readOnlyLen = 0;
                    $(':required', form).each(function() {
                        this.value = $.trim(this.value);
                        if (this['readOnly'] && !this.value) {
                            $(this).popover('show');
                            readOnlyLen++;
                        }
                    });
                    //将验证通过的字段去掉显示
                    var validFields = $(':valid', form).each(function() {
                        $(this).popover('hide');
                    });
                    //将所有未验证通过的字段显示提示
                    var invalidFields = $(':invalid', form).each(function() {
                        $(this).popover('show');
                    });
                    //聚焦到第一个错误的输入框
                    if (invalidFields.length > 0 || readOnlyLen > 0) {
                        //invalidFields.first().trigger('focus').eq(0).focus();
                        return;
                    }
                    //验证成功，继续下一步动作
                    scope.$apply(function() {
                        toDoGetter(scope);
                        /**
                         * 设置限定时间1s
                         */
                        submitTimer = $timeout(function() {
                            submitTimer = undefined;
                        }, 1000);
                    });
                });
            }
        };
    }])

    //时间格式限制，精确到分
    .directive('opSecond', ['$compile', function($compile) {
        'use strict';
        return {
            require: 'ngModel',
            link: function(scope, element, attrs, ctrl) {
                var showMsg = attrs.showMsg;
                var secondDate = new Date().format('yyyy-MM-dd hh:mm');
                element.bind('blur', function() {
                    var value = element.val();
                    if (value === '') {
                        if (showMsg) element.attr('show-msg', showMsg);
                        element[0].setCustomValidity('');
                        ctrl.$setValidity('time', true);
                        return;
                    }
                    if ((/^\d{4}$/.test(value)) || (/^\d{4}-\d{2}$/.test(value)) || (/^\d{4}-\d{2}-\d{2}$/.test(value)) || (/^\d{4}-\d{2}-\d{2}\s+\d{2}$/.test(value)) || (/^\d{4}-\d{2}-\d{2}\s+\d{2}:\d{2}$/.test(value))) {
                        if (showMsg) element.attr('show-msg', showMsg);
                        element[0].setCustomValidity('');
                        ctrl.$setValidity('time', true);
                        element.popover('hide');
                    } else {
                        if (showMsg) element.attr('show-msg', '不符合默认的时间格式：例如' + secondDate);
                        element[0].setCustomValidity('不符合默认的时间格式：例如' + secondDate);
                        ctrl.$setValidity('time', false);
                        element.popover('show');
                    }
                });
            }
        };
    }]);
})();
(function () {
    'use strict';
    /**
     * 表格模块
     * @module opui.table
     * @desc 冻结表头，多选等
     */
    angular.module('opui.table', ['ng', 'restangular']);
    
    //渲染完毕指令
    angular.module('opui.table').directive('ngRepeatFinish', ['$timeout', function($timeout) {
        'use strict';
        return {
            restrict: 'A',
            link: function(scope, element, attrs) {
                if (scope.$last) {
                    $timeout(function() {
                        element.trigger('ngRepeatFinish.table.opui');
                    });
                }
                scope.$on('$destroy', function (evt) {
                    if (scope.$last) {
                        element.trigger('hideHeader.table.opui');
                    }
                });
            }
        }
    }]);
})();
(function () {
    'use strict';
    /**
     * echarts和图表模块
     * @module opui.charts
     * @author 
     * @since 16/7/2015
     */
    angular.module('opui.charts', ['ng', 'restangular']);
})();