"use strict";
angular.module("w11kcal.app").factory("buildCalService", /*ngInject*/  function (saveService) {

    /**
     * returns amount of days for month in year
     */
    var cards, year, month, days, day, i;

    function getMonthDays (month, year) {
        var dayCounter = 31;
        // april, june, september, november 30 days
        if (month === 3 || month === 5 || month === 8 || month === 10) {
            --dayCounter;
        }
        // leap-year
        if (month === 1) {
            dayCounter = dayCounter-3;
            if (year  %   4 === 0) {
                dayCounter++;
            }
            if (year % 100 === 0) {
                dayCounter--;
            }
            if (year % 400 === 0) {
                dayCounter++;
            }
        }
        return dayCounter;
    }


    return {
        build: function (date) {
            year = date.year;
            month = date.month;
            day = new Date().getUTCDate();

            Date.prototype.mGetDay = function () {
                return (this.getDay() + 6) %7;
            };
            cards = saveService.print()[1].data;
            var firstOfMonth = new Date(year, month,1,0,0,0,0);
            var push = firstOfMonth.mGetDay();
            if (push === 0) {
                push = 7;
            }

            var lastMonthDays, yearIn, monthIn;

            // fetch January
            if(month === 0) {
                 lastMonthDays = 31-push;
                 yearIn = year -1;
                 monthIn = 11;
            } else {
                 lastMonthDays = getMonthDays(month-1,year)-push;
                 yearIn = year;
                 monthIn = month-1;
            }

            days = [];
            /**
             * pre Phase - push days of last month
             */
            for ( i = 0; i < push; i++) {
                lastMonthDays = lastMonthDays + 1;
                days.push({
                    dayOff: true,
                    i: lastMonthDays,
                    date: new Date(yearIn, monthIn, lastMonthDays, 0, 0, 0, 0),
                    cards: [],
                    weekday: moment(new Date(yearIn, monthIn, lastMonthDays, 0, 0, 0, 0)).format("dddd")
                    ///, waiting: false aktiviern wenn day auch waiting zustand haben soll
                });
            }

            /**
             * regular Phase - push days of month
             */

            for (var d = 0; d < getMonthDays(month, year); d++) {

              var isToday = false;

                if((day-1) === d && new Date().getMonth() === month) {
                    isToday = true;
                }
                days.push({
                    dayOff: false,
                    i : d+1,
                    date: new Date(year,month,d+1,0,0,0,0),
                    cards: [],
                    weekday: moment(new Date(year,month,d+1,0,0,0,0)).format("dddd"),
                    isToday: isToday
                    ///, waiting: false aktiviern wenn day auch waiting zustand haben soll
                });
            }

            /**
             * closing Phase - push days of next month
             */


            var a = days.length;
            if (a % 7 !== 0) {
                a = 7-(a % 7);
            } else {
                a = 7;
            }

            for (i = 0; i < a; i++) {
                days.push({
                    dayOff: true,
                    i: i+1,
                    date: new Date(year, month+1, i+1, 0, 0, 0, 0),
                    cards: [],
                    weekday: moment(new Date(year, month+1, i+1, 0, 0, 0, 0)).format("dddd")
                });
            }
            cards = _.groupBy(cards, 'dueDate');
            delete cards.undefined;
            days = _.indexBy(days, 'date');
            days = _.toArray(days);
            days.forEach(function (entry) {
                entry.cards= cards[entry.date];
            });
            return days;
        },


        lastView: function () {
            return month;
        }
    };
});