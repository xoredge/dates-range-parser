# Date Range Parser

The **Date Range Parser** is a standalone JavaScript library that provides a natural language-like construct for generating date range queries that would be fed into a database or search service.

This is a preferred option for power user tools as standard date widgets require the use of a mouse.

The Date Range Parser also contains a number parser that follows the same constructs.

## How To Use

```javascript
DatesRangeParser.parse('yesterday') // returns {start: Date, end: Date} for the previous day
DatesRangeParser.parse('now -> 7days') // returns {start: Date, end: Date} for the next 7 days (week) from today
```

### Explanation 
`DatesRangeParser.parse()` either returns null, if the string cannot be converted, or an object with start and end attributes.
start and end are either null (meaning no constraint) or the number of seconds since epoch.
Often these values can be passed directly to the db/search service.

#### Note on Time Zones

DatesRangeParser.js works entirely in UTC / GMT / Z (+0) timezone. Usually databases will store dates like this.
If local time is preferred, the date can be extracted with the timezone applied using methods from the JavaScript Date object.

#### Note on now

The date range parser can generate several types of queries relative to now, which is defined as the current time on the user's computer (to the millisecond).
This can be overridden by setting DatesRangeParser.now to a new value.

## Quick Syntax Guide

* now
* today
* tomorrow
* yesterday
* last/this/next week
* last/this/next month
* last/this/next year

* 1000secs
* 5mins
* 1day
* 2days
* 8d
* 9months
* 2yrs

* 5
* 5:35
* 5:35:12

* 2011
* 2011-03
* 2011-03-04

* 2011-03-04 04
* 2011-03-04 04:15
* 2011-03-04 04:15:29

* 2010 -> 2011
* 2005-11-05 16:13:49 -> 2005-11-06 05:12:11
* last week -> next week
* 2011-05 ->
* < now
* 2000-01-01 -> last week

* 2000 -> 10y
* 3mins < now
* last year -> 6months

* 2010-05-13 05:13 <> 10m
* now <> 1yr
* lastweek <> 1month

## Syntax in More Detail

### Keywords / Key Phrases

* now
* today
* tomorrow
* yesterday
* last/this/next week
* last/this/next month
* last/this/next quarter
* last/this/next year

Creates a range covering all value dates relative to now.

### Ranges

* 1000secs
* 5mins
* 1day
* 2days
* 8d
* 9months
* 2yrs

Entering a range alone creates a date search centered on now and spreading into the past and future by the specified amount.
Examples:
Given now is 2001-09-09 01:46:40
- "3days" searches from 3 days in the past to 3 days in the future (2001-09-03 01:46:40 -> 2001-09-12 01:46:40)
- "1hr" searches from 1 hour in the past to 1 hour in the future (2001-09-09 00:46:40 -> 2001-09-09 02:46:40)
- "600mins" searches from 10 hours in the past to 10 hours in the future (2001-09-08 15:46:40 -> 2001-09-09 11:46:40)

The following aliases can be used with ranges:
- seconds: s, sec, secs, second, seconds
- minutes: m, min, mins, minute, minutes
- hours: h, hr, hrs, hour, hours
- days: d, day, days
- months: mo, mos, month, months
- quarters: quarter
- years: y, yr, yrs, year, years

Note: Months are always calculated as 31 days, and years are always calculated as 365 days.

### Dates

* 2011
* 2011-03
* 2011-03-04

A date format alone will search the range of dates covered by the date.
- "2011" searches the year of 2011 (2011-01-01 00:00:00.000 -> 2011-12-31 23:59:59.999)
- "2011-03" searches the month of March 2011 (2011-03-01 00:00:00.000 -> 2011-03-31 23:59:59.999)
- "2011-03-04" searches the day of 4th March 2011 (2011-03-04 00:00:00.000 -> 2011-03-04 23:59:59.999)

Dates must be specified in the YYYY-MM-DD format.

### Times

* 5
* 5:35
* 5:35:12

Entering a time creates a range in today.
Examples:
- "5" searches the hour of 5 AM for today (today 05:00:00.000 -> today 05:59:59.999)
- "5:35" searches the minute of 5:35 for today (today 05:35:00.000 -> today 05:35:59.999)
- "5:35:12" searches the second of 5:35:12 for today (today 05:35:12.000 -> today 05:35:12.999)

Times must be entered in the H-MM-SS format, and AM/PM cannot be used.

### DateTime

* 2011-03-04 04
* 2011-03-04 04:15
* 2011-03-04 04:15:29

Entering a date and time part creates a range on the specified interval.
Examples:
- "2011-03-04 04" searches the hour of 4 AM, 4th March 2011 (2011-03-04 04:00:00.000 -> 2011-03-04 04:59:59.999)
- "2011-03-04 04:15" searches the minute of 15 minutes past 4 AM, 4th March 2011 (2011-03-04 04:15:00.000 -> 2011-03-04 04:15:59.999)
- "2011-03-04 04:15:29" searches the second of 29 seconds past 4:15 AM, 4th March 2011 (2011-03-04 04:15:29.000 -> 2011-03-04 04:15:29.999)

### Date Range

* 2010 -> 2011
* 2005-11-05 16:13:49 -> 2005-11-06 05:12:11
* last week -> next week
* 2011-05 ->
* < now
* 2000-01-01 -> last week

Entering two dates separated by "->" creates a range between the two dates.
- "2010 -> 2011" searches the range from 2010-01-01 00:00:00.000 to 2011-12-31 23:59:59.999
- "2005-11-05 16:13:49 -> 2005-11-06 05:12:11" searches the range from 2005-11-05 16:13:49.000 to 2005-11-06 05:12:11.999
- "last week -> next week" searches the range from the start of last week to the end of next week
- "2011-05 ->" searches the range from 2011-05-01 00:00:00.000 to the end of time
- "< now" searches the range from the start of time to the current moment (exclusive)
- "2000-01-01 -> last week" searches the range from 2000-01-01 00:00:00.000 to the end of last week

### Combining Ranges

* 2000 -> 10y
* 3mins < now
* last year -> 6months

Ranges can be combined to create more complex queries.
- "2000 -> 10y" searches the range from 2000-01-01 00:00:00.000 to 10 years in the future
- "3mins < now" searches the range from 3 minutes in the past to the current moment (exclusive)
- "last year -> 6months" searches the range from the start of last year to 6 months in the future

### Date and Time Offset

* 2010-05-13 05:13 <> 10m
* now <> 1yr
* lastweek <> 1month

Entering a date or range followed by "<>" and a range creates an offset search.
- "2010-05-13 05:13 <> 10m" searches the range 10 minutes before and after 2010-05-13 05:13:00.000
- "now <> 1yr" searches the range 1 year before and after the current moment (exclusive)
- "lastweek <> 1month" searches the range 1 month before and after the start of last week

## License

The Date Range Parser is licensed under the [MIT License](https://opensource.org/licenses/MIT).
