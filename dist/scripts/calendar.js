define('calendar_templates', [], function () {
    'use strict';
    var CalendarTemplates = function () {
        return this;
    };
    CalendarTemplates.prototype = {
        templates: {
            dayTemplate: '<div class=\'calendar__day\'>{{day}}</div>',
            dayNameTemplate: '<div class=\'calendar__day-name\'>{{day_name}}</div>',
            calendarTemplate: '<div class=\'calendar\'><div class=\'calendar__caption\'>' + '<button class=\'calendar__prev-month\'></button>' + '<button class=\'calendar__next-month\'></button>' + '<div class=\'calendar__month-and-year\'>' + '<span class=\'calendar__month-name\'>{Month Name}</span>' + '<span class=\'calendar__year-name\'>{Year Name}</span>' + '</div>' + '</div>' + '<div class=\'calendar__header\'></div>' + '<div class=\'calendar__body\'></div>' + '</div>'
        },
        _parseLineIntoDOMElement: function (text) {
            var _templateChild, _template = document.createElement('body'), _fragment = document.createDocumentFragment();
            _template.innerHTML = text;
            while (_template.firstChild) {
                _templateChild = _template.firstChild;
                _fragment.appendChild(_templateChild);
            }
            return _fragment.childNodes[0];
        },
        dayTemplate: function (day) {
            var _dayElement = this._parseLineIntoDOMElement(this.templates.dayTemplate.toString());
            _dayElement.date = day.date;
            if (day.isInMonth) {
                _dayElement.classList.add('calendar__day--in-month');
            } else {
                _dayElement.classList.add('calendar__day--out-month');
            }
            if (day.isWeekend) {
                _dayElement.classList.add('calendar__day--weekend');
            }
            if (day.isToday) {
                _dayElement.classList.add('calendar__day--today');
            }
            _dayElement.innerHTML = day.date.getDate().toString();
            return _dayElement;
        },
        dayNameTemplate: function (dayName) {
            var _dayNameElement = this._parseLineIntoDOMElement(this.templates.dayNameTemplate.toString());
            _dayNameElement.dayName = dayName.name;
            if (dayName.isWeekend) {
                _dayNameElement.classList.add('calendar__day-name--weekend');
            }
            _dayNameElement.innerHTML = dayName.name;
            return _dayNameElement;
        },
        calendarTemplate: function () {
            return this._parseLineIntoDOMElement(this.templates.calendarTemplate.toString());
        }
    };
    return CalendarTemplates;
});
define('event_machine', [], function () {
    'use strict';
    var EventMachine = function () {
        var funcArray = {};
        this.on = function (events, eventHandler) {
            events.split(/\s+/).forEach(function (event) {
                !funcArray[event] ? funcArray[event] = [] : 0;
                funcArray[event].push(eventHandler);
            });
            return this;
        };
        this.off = function (events, eventHandler) {
            events.split(/\s+/).forEach(function (event) {
                if (funcArray[event])
                    funcArray[event] = funcArray[event].filter(function (handler) {
                        return !(handler === eventHandler);
                    });
            });
            return this;
        };
        this.trigger = function (events, parameters) {
            var that = this;
            events.split(/\s+/).forEach(function (event) {
                if (funcArray[event]) {
                    funcArray[event].forEach(function (handler) {
                        handler.apply(that, parameters);
                    });
                }
            });
            return this;
        };
    };
    return EventMachine;
});
define('calendar_helper', [], function () {
    'use strict';
    Element.prototype.deleteAllChildNodes = function () {
        while (this.firstChild) {
            this.removeChild(this.firstChild);
        }
        return this;
    };
});
define('calendar', [
    'calendar_templates',
    'event_machine',
    'moment',
    'calendar_helper'
], function (CalendarTemplates, EventMachine, moment) {
    'use strict';
    var calendarTemplates = new CalendarTemplates(), _merge = function (into, obj) {
            var key;
            for (key in obj) {
                if (obj.hasOwnProperty(key)) {
                    if (!into[key]) {
                        into[key] = [];
                    }
                    into[key] = obj[key];
                }
            }
            return into;
        };
    var Calendar = function (container, properties) {
        EventMachine.call(this);
        moment = moment || window.moment;
        moment.locale('en');
        var _root, _that = this, _config = {
                year: new Date().getFullYear(),
                month: new Date().getMonth() + 1,
                firstDayOfWeek: 'SUN',
                locale: 'en',
                daysInWeek: 7,
                weekends: [
                    'Sat',
                    'Sun'
                ]
            }, _model = {
                daysNames: [],
                days: [],
                currentMonth: ''
            };
        this.getRoot = function () {
            return _root;
        };
        this.set = function (property, value) {
            var _newConfig = _merge({}, _config);
            _newConfig[property] = value;
            _model = _that.generateModel(_newConfig);
            _config = _merge(_config, _newConfig);
            _that.render();
        };
        this.get = function (property) {
            return property ? _config[property] : _config;
        };
        this.nextMonth = function () {
            if (_config.month === 12) {
                _config.year = (parseFloat(_config.year) + 1).toString();
            }
            _that.set('month', _config.month.valueOf() % 12 + 1);
        };
        this.previousMonth = function () {
            if (_config.month === 1) {
                _config.year = (parseFloat(_config.year) - 1).toString();
                _that.set('month', 12);
            } else {
                _that.set('month', (_config.month.valueOf() - 1) % 12);
            }
        };
        this.setConfig = function (configToSet) {
            var _newConfig = _merge(_merge({}, _config), configToSet);
            _model = _that.generateModel(_newConfig);
            _config = _merge(_config, configToSet);
            _that.render();
        };
        this.getConfig = function () {
            return _config;
        };
        this.render = function () {
            _that.renderCaption(_config, _model);
            _root.querySelector('.calendar__header').deleteAllChildNodes().appendChild(_that.renderHeader(_config, _model));
            _root.querySelector('.calendar__body').deleteAllChildNodes().appendChild(_that.renderBody(_model));
            _that.trigger('render', [_that]);
            return _that;
        };
        this.showToday = function () {
            var _dayDate, _today = moment().locale(_config.locale);
            _config.month = _today.get('month') + 1;
            _config.year = _today.get('year');
            _model = _that.generateModel(_config);
            _that.render();
            Array.prototype.slice.call(_root.querySelector('.calendar__body').childNodes).some(function (day) {
                _dayDate = moment(day.date).locale(_config.locale);
                if (_today.diff(_dayDate, 'days') === 0) {
                    return !day.classList.add('today');
                }
            });
            return _today.toDate();
        };
        function _setEvents() {
            _root.addEventListener('click', function (e) {
                if (e.target.classList.contains('calendar__next-month') || e.target.classList.contains('calendar__prev-month')) {
                    if (e.target.classList.contains('calendar__next-month')) {
                        _that.nextMonth();
                    } else {
                        _that.previousMonth();
                    }
                    _that.trigger('monthChanged', [_config.month]);
                } else if (e.target.date) {
                    _that.trigger('daySelected', [e.target.date]);
                }
            });
        }
        function _init() {
            _root = calendarTemplates.calendarTemplate();
            container.appendChild(_root);
            _config = _merge(_config, properties);
            _model = _that.generateModel(_config);
            _that.render();
            _setEvents();
            _that.trigger('load', [_that]);
            return _that;
        }
        _init();
    };
    function _getFirstDate(config) {
        var _date = moment([
            config.year,
            config.month - 1,
            1
        ]);
        return _date.isAfter(_date.clone().day(config.firstDayOfWeek)) ? _date.day(config.firstDayOfWeek) : _date.day(config.firstDayOfWeek).subtract(7, 'days');
    }
    function _getDaysArray(date, count, config) {
        return Array.apply(null, { length: count }).map(function () {
            var _currentDayName = date.clone().locale('en').format('ddd'), _day = {
                    isInMonth: date.get('month') === config.month - 1,
                    isWeekend: config.weekends.indexOf(_currentDayName) !== -1,
                    isToday: moment().startOf('day').diff(date, 'days') ? false : true,
                    date: date.clone().toDate()
                };
            date.add(1, 'days');
            return _day;
        });
    }
    function _getDaysNamesArray(date, config) {
        return Array.apply(null, { length: config.daysInWeek }).map(function () {
            var _dayName = {
                name: date.format('ddd'),
                isWeekend: config.weekends.indexOf(date.clone().locale('en').format('ddd')) !== -1
            };
            date.add(1, 'days');
            return _dayName;
        });
    }
    Calendar.prototype.generateModel = function (config) {
        var _date = _getFirstDate(config).locale(config.locale), _model = {}, _maxDaysNumber = (1 + parseFloat(Math.ceil(30 / config.daysInWeek))) * config.daysInWeek;
        if (!_date.isValid()) {
            throw 'Date validation error: ' + _date.invalidAt();
        }
        _model.daysNames = _getDaysNamesArray(_date.clone(), config);
        _model.currentMonth = moment().set('month', config.month - 1).format('MMMM');
        _model.days = _getDaysArray(_date, _maxDaysNumber, config);
        return _model;
    };
    Calendar.prototype.renderCaption = function (config, model) {
        this.getRoot().querySelector('.calendar__month-name').innerHTML = model.currentMonth.toString();
        this.getRoot().querySelector('.calendar__year-name').innerHTML = config.year.toString();
    };
    Calendar.prototype.renderHeader = function (config, model) {
        if (config.daysInWeek / 7 - Math.floor(config.daysInWeek / 7) === 0) {
            var _headerElement = document.createDocumentFragment();
            model.daysNames.map(function (dayName) {
                _headerElement.appendChild(calendarTemplates.dayNameTemplate(dayName));
            });
            return _headerElement;
        }
    };
    Calendar.prototype.renderBody = function (model) {
        var _bodyElement = document.createDocumentFragment();
        model.days.forEach(function (day) {
            _bodyElement.appendChild(calendarTemplates.dayTemplate(day));
        });
        return _bodyElement;
    };
    return Calendar;
});