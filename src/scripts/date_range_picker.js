/* global define: true */
define(["calendar", "calendar_templates", "event_machine",
      "moment", "calendar_helper"
    ],
    function(Calendar, CalendarTemplates, EventMachine, moment) {
      "use strict";

      /**
       *
       * @param container {HTMLElement}
       * @param calendarConfig {Object}
       * @param newStart {Date|String}
       * @param newEnd {Date|String}
       * @constructor
       */
      var DateRangePicker = function(container, newStart, newEnd, calendarConfig) {
        EventMachine.call(this);
        moment.locale("en");
        var _root,
            _range = {
              start : moment(),
              end: moment()
            },
            _that = this;

        this.getRoot = function getRoot() {
          return _root;
        };

        this.getRange = function() {
          return {
            start: _range.start.toDate(),
            end: _range.end.toDate()
          };
        };

        this.setStartDate = function (date) {
          _range.start =  moment(new Date(date)) || _range.start;
          _that.configMonthAndYear();
          _that.render();
          _that.trigger("rangeChanged", [
            _range.start.toDate(), _range.end.toDate()
          ]);
        };

        this.setEndDate = function (date) {
          _range.end =  moment(new Date(date)) || _range.end;
          _that.configMonthAndYear();
          _that.render();
          _that.trigger("rangeChanged", [
            _range.start.toDate(), _range.end.toDate()
          ]);
        };

        this.changeRange = function changeRange(start, end) {
          if ((start)&&(end)) {
            _range = {
              start: moment(new Date(start)) || _range.start,
              end: moment(new Date(end)) || _range.end
            };
            _that.configMonthAndYear();
            _that.render();
            _that.trigger("rangeChanged", [
              _range.start.toDate(), _range.end.toDate()
            ]);
          }
          return _range;
        };

        function _renderCalendarSelectedDays(calendar) {
          var _momentDate,
              _calendarBody = calendar.getRoot().querySelector(".calendar__body");
          Array.prototype.slice.call(_calendarBody.childNodes)
              .forEach(function(day) {
                _momentDate = moment(day.date);

                if (_momentDate.isAfter(_range.start) && _momentDate.isBefore(_range.end)) {
                  day.classList.add("calendar__day--selected");
                }
                if (_momentDate.calendar() === _range.start.calendar()) {
                  day.classList.add("calendar__day--selected--start");
                }
                if (_momentDate.calendar() === _range.end.calendar()) {
                  day.classList.add("calendar__day--selected--end");
                }
              });
          return _that;
        }

        this.renderSelectedDays = function renderSelectedDays() {
          _renderCalendarSelectedDays(_that.startCalendar);
          _renderCalendarSelectedDays(_that.endCalendar);
        };

        this.render = function() {
          _that.startCalendar.render();
          _that.endCalendar.render();
          _that.renderSelectedDays();
        };

        this.configMonthAndYear = function() {
          _that.startCalendar.setConfig({
            month: _range.start.get("month") + 1,
            year: _range.start.get("year")
          });

          _that.endCalendar.setConfig({
            month: _range.end.get("month") + 1,
            year: _range.end.get("year")
          });

        };

        /**
         *
         * @param e - event that triggered on calendar
         * @param type{"start"|"end"} - defines type of range changed
         */
        function _watchRangeChange(e, type) {
          var _difference, _selectedDate;
          e.preventDefault();

          if (e.target.date) {
            _difference = _range.end.diff(_range.start);
            _selectedDate = moment(e.target.date);

            if (type === "start") {
              if (_selectedDate.calendar() !== _range.end.calendar()) {
                _range.end = _selectedDate.clone();
                if (_selectedDate.isBefore(_range.start)) {
                  _range.start = _range.end.clone().subtract(_difference, "milliseconds");
                }
                _that.render();
                _that.trigger("rangeChanged", [
                  _range.start.clone().toDate(), _range.end.clone().toDate()
                ]);
              }
            } else {
              if (_selectedDate.calendar() !== _range.start.calendar()) {
                _range.start = _selectedDate.clone();
                if (_selectedDate.isAfter(_range.end)) {
                  _range.end = _range.start.clone().add(_difference, "milliseconds");
                }
                _that.render();
                _that.trigger("rangeChanged", [
                  _range.start.clone().toDate(), _range.end.clone().toDate()
                ]);
              }
            }
          }
        }

        function _setEvents() {

          function _addStartCalendarDayDrag(e) {
            _watchRangeChange(e, "start");
          }

          function _addEndCalendarDayDrag(e) {
            _watchRangeChange(e, "end");
          }

          function _removeDayDrag() {
            _that.configMonthAndYear();
            _that.renderSelectedDays();

            document.removeEventListener("mousemove", _addStartCalendarDayDrag);
            document.removeEventListener("mousemove", _addEndCalendarDayDrag);
            document.removeEventListener("mouseup", _removeDayDrag);
          }

          _that.startCalendar.getRoot()
              .addEventListener("mousedown", function(e) {
                if (e.target.date) {
                  _watchRangeChange(e, "end");
                  document.addEventListener("mousemove", _addEndCalendarDayDrag);
                  document.addEventListener("mouseup", _removeDayDrag);
                }
              });

          _that.endCalendar.getRoot()
              .addEventListener("mousedown", function(e) {
                if (e.target.date) {
                  _watchRangeChange(e, "start");
                  document.addEventListener("mousemove", _addStartCalendarDayDrag);
                  document.addEventListener("mouseup", _removeDayDrag);
                }
              });

          _that.startCalendar.on("render", _that.renderSelectedDays);
          _that.endCalendar.on("render", _that.renderSelectedDays);
        }

        function _init() {
          _root = document.createElement("div");
          _root.classList.add("date-range-picker");

          _that.startCalendar = new Calendar(_root, calendarConfig);
          _that.endCalendar = new Calendar(_root, calendarConfig);

          _range = _that.changeRange(newStart, newEnd);
          _range.start.format("LLL");
          _range.end.format("LLL");

          container.appendChild(_root);

          _that.startCalendar.getRoot().classList.add("calendar--date-range-picker--start");
          _that.endCalendar.getRoot().classList.add("calendar--date-range-picker--end");

          _that.renderSelectedDays();

          _setEvents();

          _that.trigger("load", [_that]);
        }

        _init.call(this);
      };

      return DateRangePicker;
    });
