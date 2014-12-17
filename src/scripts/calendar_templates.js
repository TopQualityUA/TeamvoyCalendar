/* global define: true */
define([],
    function() {
        "use strict";

        var CalendarTemplates = function() {
        return this;
    };

    CalendarTemplates.prototype = {
        templates: {
            dayTemplate: "<div class='calendar__day'>{{day}}</div>",
            dayNameTemplate: "<div class='calendar__day-name'>{{day_name}}</div>",
            calendarTemplate: "<div class='calendar'><div class='calendar__caption'>" +
                "<button class='calendar__button calendar__button--desc'></button>" +
                "<button class='calendar__button calendar__button--asc'></button>" +
                "<div class='calendar__month-and-year'>" +
                "<span class='calendar__month-name'>{Month Name}</span>" +
                "<span class='calendar__year-name'>{Year Name}</span>" +
                "</div>" +
                "</div>" +
                "<div class='calendar__header'></div>" +
                "<div class='calendar__body'></div>" +
                "</div>"
        },
        _parseLineIntoDOMElement: function(text) {
            var _templateChild,
                _template = document.createElement("body"),
                _fragment = document.createDocumentFragment();
            _template.innerHTML = text;
            while (_template.firstChild) {
                _templateChild = _template.firstChild;
                _fragment.appendChild(_templateChild);
            }
            return _fragment.childNodes[0];
        },
        dayTemplate: function(day) {
            var _dayElement = this._parseLineIntoDOMElement(this.templates.dayTemplate.toString());
            _dayElement.date = day.date;
            if (day.isInMonth) {
                _dayElement.classList.add("calendar__day--in-month");
            } else {
                _dayElement.classList.add("calendar__day--out-month");
            }
            if (day.isWeekend) {
                _dayElement.classList.add("calendar__day--weekend");
            }
            if (day.isToday) {
                _dayElement.classList.add("calendar__day--today");
            }
            _dayElement.innerHTML = day.date.getDate().toString();
            return _dayElement;
        },
        dayNameTemplate: function(dayName) {
            var _dayNameElement = this._parseLineIntoDOMElement(this.templates.dayNameTemplate.toString());
            _dayNameElement.dayName = dayName.name;
            if (dayName.isWeekend) {
                _dayNameElement.classList.add("calendar__day-name--weekend");
            }
            _dayNameElement.innerHTML = dayName.name;
            return _dayNameElement;
        },
        calendarTemplate: function() {
            return this._parseLineIntoDOMElement(this.templates.calendarTemplate.toString());
        }
    };

        return CalendarTemplates;
    });