/* global define: true */
define(["./calendar_templates", "../../library/event_machine",
        "moment", "./calendar_helper"
    ],
    function(CalendarTemplates, EventMachine, moment) {
        "use strict";
        /**
         * Creates calendar and inserts it in container
         * @param container - Place in the DOM where calendar will be inserted
         * @param properties - Optional. Config object, has such fields like: year, month,
         * firstDayOfWeek, locale, output
         * @constructor
         */
        var calendarTemplates = new CalendarTemplates(),
           _merge = function(into, obj) {
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
        var Calendar = function(container, properties) {
            EventMachine.call(this);

            //if moment wasn't included like module
            moment = moment || window.moment;

            moment.locale("en");
            var _root,
                _that = this,
                _config = {
                    //default values
                    year: (new Date()).getFullYear(),
                    month: (new Date()).getMonth() + 1,
                    firstDayOfWeek: "SUN",
                    locale: "en",
                    daysInWeek: 7,
                    weekends: ["Sat", "Sun"]
                },
                _model = {
                    daysNames: [],
                    days: [],
                    currentMonth: ""
                };


            /**
             * Get root element
             * @returns {element}
             */
            this.getRoot = function() {
                return _root;
            };

            /**
             * Set config property value
             * @param property - name of config property to set
             * @param value - value to set
             */
            this.set = function(property, value) {
                var _newConfig = _merge({}, _config);
                _newConfig[property] = value;
                _model = _that.generateModel(_newConfig);
                _config = _merge(_config, _newConfig);
                _that.render();
            };

            /**
             * Get config property value
             * @param property - name of config property to get
             * @returns {} - returns config property value or config object if
             * property wasn't specified
             */
            this.get = function(property) {
                return property ? _config[property] : _config;
            };

            /**
             * Sets calendar model to next manth
             */
            this.nextMonth = function() {
                if (_config.month === 12) {
                    _config.year = (parseFloat(_config.year) + 1).toString();
                }
                _that.set("month", _config.month.valueOf() % 12 + 1);
            };

            /**
             * Sets calendar model to previous manth
             */
            this.previousMonth = function() {
                if (_config.month === 1) {
                    _config.year = (parseFloat(_config.year) - 1).toString();
                    _that.set("month", 12);
                } else {
                    _that.set("month", (_config.month.valueOf() - 1) % 12);
                }
            };

            /**
             * Sets new calendar config
             */
            this.setConfig = function(configToSet) {
                var _newConfig = _merge(_merge({}, _config), configToSet);
                _model = _that.generateModel(_newConfig);
                _config = _merge(_config, configToSet);
                _that.render();
            };

            /**
             * Gets calendar config
             */
            this.getConfig = function() {
                return _config;
            };

            /**
             * Calls rendering of all calendar parts
             * and appends result to needed elements
             * @returns {global.Calendar}
             */
            this.render = function() {
                _that.renderCaption(_config, _model);

                _root.querySelector(".calendar__header")
                    .deleteAllChildNodes()
                    .appendChild(_that.renderHeader(_config, _model));

                _root.querySelector(".calendar__body")
                    .deleteAllChildNodes()
                    .appendChild(_that.renderBody(_model));

                _that.trigger("render", [_that]);
                return _that;
            };

            /**
             * Sets config month and year to today's month and year
             * then generates and renders new data and searches for today's day
             * @returns {Date}
             */
            this.showToday = function() {

                //gets moment js today object, finds day with same date attribute
                //and adds 'today' class
                var _dayDate,
                    _today = moment().locale(_config.locale);
                _config.month = _today.get("month") + 1;
                _config.year = _today.get("year");
                _model = _that.generateModel(_config);
                _that.render();
                Array.prototype.slice.call(_root.querySelector(".calendar__body").childNodes)
                    .some(function(day) {
                        _dayDate = moment(day.date).locale(_config.locale);
                        if (_today.diff(_dayDate, "days") === 0) {
                            return !day.classList.add("today");
                        }
                    });
                return _today.toDate();
            };

            /**
             * Setting all needed calendar events:
             * monthChanged, daySelected
             */
            function _setEvents() {
                _root
                    .addEventListener("click", function(e) {
                        e.stopPropagation();
                        if (e.target.classList.contains("calendar__next-month") ||
                            e.target.classList.contains("calendar__prev-month")) {
                            if (e.target.classList.contains("calendar__next-month")) {
                                _that.nextMonth();
                            } else {
                                _that.previousMonth();
                            }
                            _that.trigger("monthChanged", [_config.month]);
                        } else if (e.target.date) {
                            _that.trigger("daySelected", [e.target.date]);
                        }
                    });
            }

            /**
             * Initializing calendar
             * @returns {global.Calendar}
             */
            function _init() {
                _root = calendarTemplates.calendarTemplate();
                container.appendChild(_root);
                _config = _merge(_config, properties);
                _model = _that.generateModel(_config);
                _that.render();
                _setEvents();
                _that.trigger("load", [_that]);
                return _that;
            }

            _init();
        };



        /**
         * Gets first day of the calendar from config
         * @param config
         * @returns {*}
         */
        function _getFirstDate(config) {
            var _date = moment([config.year, config.month - 1, 1]);

            return _date.isAfter(_date.clone().day(config.firstDayOfWeek)) ?
                _date.day(config.firstDayOfWeek) :
                _date.day(config.firstDayOfWeek).subtract(7, "days");
        }

        /**
         * Function for generating array of days from moment js date, count and config
         * @param date
         * @param count
         * @param config
         * @returns {Array}
         */
        function _getDaysArray(date, count, config) {
            return Array.apply(null, {
                length: count
            })
                .map(function() {
                    var _currentDayName = date.clone().locale("en").format("ddd"),
                        _day = {
                            isInMonth: date.get("month") === (config.month - 1),
                            isWeekend: (config.weekends.indexOf(_currentDayName) !== -1),
                            isToday: moment().startOf("day").diff(date, "days") ? false : true,
                            date: date.clone().toDate()
                        };
                    date.add(1, "days");
                    return _day;
                });
        }

        /**
         * Function for generating array of days names from moment js date and config
         * @param date
         * @param config
         * @returns {Array}
         */
        function _getDaysNamesArray(date, config) {
            return Array.apply(null, {
                length: config.daysInWeek
            })
                .map(function() {
                    var _dayName = {
                        name: date.format("ddd"),
                        isWeekend: (config.weekends.indexOf(date.clone().locale("en").format("ddd")) !== -1)
                    };
                    date.add(1, "days");
                    return _dayName;
                });
        }

        /**
         * Generating calendar
         * @param config
         * @returns {number/Object} - if success returns model object,
         * else triggers on error and returns error number from 0 to 6
         * (0-error in day, 1-month, 2-year, ...)
         */
        Calendar.prototype.generateModel = function(config) {
            var _date = _getFirstDate(config).locale(config.locale),
                _model = {},
                _maxDaysNumber = (1 + parseFloat(Math.ceil(30 / config.daysInWeek))) * config.daysInWeek;
            if (!_date.isValid()) {
                throw "Date validation error: " + _date.invalidAt();
            }
            _model.daysNames = _getDaysNamesArray(_date.clone(), config);
            _model.currentMonth = moment().set('month', config.month-1).format("MMMM");
            _model.days = _getDaysArray(_date, _maxDaysNumber, config);
            return _model;
        };

        /**
         * Rendering caption
         * @param config
         * @param model
         * @returns {DocumentFragment}
         */
        Calendar.prototype.renderCaption = function(config, model) {
            this.getRoot().querySelector(".calendar__month-name")
                .innerHTML = model.currentMonth.toString();
            this.getRoot().querySelector(".calendar__year-name")
                .innerHTML = config.year.toString();
        };

        /**
         * Rendering header
         * @param config
         * @param model
         * @returns {DocumentFragment} - if success returns header HTMLElement
         * else returns false if count days in week isn't multiply of 7
         *
         */
        Calendar.prototype.renderHeader = function(config, model) {
            if (config.daysInWeek / 7 - Math.floor(config.daysInWeek / 7) === 0) {
                var _headerElement = document.createDocumentFragment();
                model.daysNames.map(function(dayName) {
                    _headerElement.appendChild(calendarTemplates.dayNameTemplate(dayName));
                });
                return _headerElement;
            }
        };

        /**
         * Rendering body
         * @param model
         * @returns {DocumentFragment}
         */
        Calendar.prototype.renderBody = function(model) {
            var _bodyElement = document.createDocumentFragment();
            model.days.forEach(function(day) {
                _bodyElement.appendChild(calendarTemplates.dayTemplate(day));
            });
            return _bodyElement;
        };

        return Calendar;
    });
