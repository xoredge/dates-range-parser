const datesRangeParser = require("./index");

var sec = 1000;
var min = sec * 60;
var hr = min * 60;
var day = hr * 24;

function assertEquals(msg, a, b) {
  if (a !== b) {
    throw new Error(msg + " " + a + " !== " + b);
  }
}

function assertRange(s, e, exp) {
  var r = drp._parseDate(exp);
  assertEquals("start " + exp, s, r.start);
  assertEquals("end " + exp, e, r.end);
}

testParseDate = function () {
  var now = 1000000000000; // sunday 09 sep 2001 01:46:40 GMT
  var nowD = 999993600000; // sunday 09 sep 2001 00:00:00 GMT
  var nowM = 999302400000; // saturday 01 sep 2001 00:00:00 GMT
  var nowY = 978307200000; // monday 01 jan 2001 00:00:00 GMT

  var y2010 = 1262304000000;
  var y2011 = 1293840000000;
  var y2021 = 1609459200000;

  var drp = datesRangeParser;

  drp.now = now; // set internal representation of now to a known value
  drp.defaultRange = day;

  function assertRange(s, e, exp) {
    var r = drp._parseDate(exp);
    assertEquals("start " + exp, s, r.start);
    assertEquals("end " + exp, e, r.end);
  }

  function assertFail(exp) {
    var r = drp.parse(exp);
    assertEquals("null " + exp, null, r);
  }

  /* testing now
		returns a range centered on the current date/time +/- 1 day
		the default range (1 day) can be set globally using drp.defaultRange
	*/
  // assertRange(now - day, now + day, "now");

  /* testing keywords
		return a range for that keyworkd
	*/
  assertRange(nowD, nowD + day, "today");
  console.log("first pass");
  assertRange(nowD, nowD + 7 * day, "this week"); // produces a range from sunday 00:00:00.000 to saturday 23:59:59.999
  assertRange(nowM, nowM + 30 * day, "this month");
  assertRange(nowY, nowY + 365 * day, "this year");
  assertRange(nowD + day, nowD + 2 * day, "tomorrow");
  assertRange(nowD + 7 * day, nowD + 14 * day, "next week");
  assertRange(nowM + 30 * day, nowM + (30 + 31) * day, "next month");
  assertRange(nowY + 365 * day, nowY + (365 + 365) * day, "next year");
  assertRange(nowD - day, nowD, "yesterday");
  assertRange(nowD - 7 * day, nowD, "last week");
  assertRange(nowM - 31 * day, nowM, "last month");
  assertRange(nowY - 366 * day, nowY, "last year");

  /* testing times 
		entering a time creates a range with
			low point being the time entered, right filled with 0's
			high point being the time entered + 1 unit of the smallest precision entered
		examples:
			"5" searches the hour of 5am for today ( <today> 05:00:00.000 -> <today> 05:59:59.999 )
			"5:35" searches the minute of 5:35 for today  ( <today> 05:35:00.000 -> <today> 05:35:59.999 )
			"5:35:12" searches the second of 5:35:12 for today  ( <today> 05:35:12.000 -> <today> 05:35:12.999 )
	*/
  assertRange(nowD, nowD + hr, "0");
  assertRange(nowD + hr, nowD + 2 * hr, "1");
  assertRange(nowD + 23 * hr, nowD + 24 * hr, "23");
  assertRange(nowD + 3 * hr + 30 * min, nowD + 3 * hr + 31 * min, "3:30");
  assertRange(
    nowD + 3 * hr + 30 * min + 0 * sec,
    nowD + 3 * hr + 30 * min + 1 * sec,
    "3:30:00"
  );
  assertRange(
    nowD + 3 * hr + 30 * min + 40 * sec,
    nowD + 3 * hr + 30 * min + 41 * sec,
    "3:30:40"
  );
  assertRange(nowD + 3 * hr + 59 * min + 59 * sec, nowD + 4 * hr, "3:59:59");
  assertRange(nowD + 23 * hr + 59 * min + 59 * sec, nowD + 1 * day, "23:59:59");
  assertRange(nowD, nowD + 1 * sec, "0:00:00");
  assertRange(nowD, nowD + 1 * sec, "00:00:00");

  /* testing dates 
		entering a date creates a range with
			low point being the time entered, right filled with 0's
			high point being the time entered + 1 unit of the smallest precision entered
		examples:
			"2011" searches the year of 2011 (2011-01-01 00:00:00.000 -> 2011-12-31 23:59:59.999)
			"2011-03" searches the month of march 2011  (2011-03-01 00:00:00.000 -> 2011-03-31 23:59:59.999)
			"2011-03-04" searches the day of 4th march 2011  (2011-03-04 00:00:00.000 -> 2011-03-04 23:59:59.999)
	*/
  assertRange(y2010, y2011, "2010");
  assertRange(y2010, y2010 + 31 * day, "2010-01");
  assertRange(y2010 + 31 * day, y2010 + (31 + 28) * day, "2010-02");
  assertRange(
    y2010 + (31 + 28 + 31 + 30 + 31 + 30 + 31 + 31 + 30 + 31 + 30) * day,
    y2011,
    "2010-12"
  );
  assertRange(y2010 + (31 + 2) * day, y2010 + (31 + 3) * day, "2010-02-03");
  assertRange(
    y2010 + (31 + 28 + 31 + 30 + 31 + 30 + 31 + 31 + 30 + 31 + 30 + 30) * day,
    y2011,
    "2010-12-31"
  );

  /* testing date/time
		entering a date and time part
			low point being the time entered, right filled with 0's
			high point being the time entered + 1 unit of the smallest precision entered
		examples:
			"2011-03-04 04" searches the hour of 4am march 4th 2011 (2011-03-04 04:00:00.000 -> 2011-03-04 04:59:59.999)
			"2011-03-04 04:15" searches the minute of 15 mins past 4am march 4th 2011 (2011-03-04 04:15:00.000 -> 2011-03-04 04:15:59.999)
			"2011-03-04 04:15:29" searches the second of 15:29 past 4am march 4th 2011 (2011-03-04 04:15:29.000 -> 2011-03-04 04:15:29.999)
	*/
  assertRange(y2010, y2010 + hr, "2010-01-01 00");
  assertRange(y2010 + 3 * hr, y2010 + 4 * hr, "2010-01-01 03");
  assertRange(
    y2010 + 3 * hr + 44 * min,
    y2010 + 3 * hr + 45 * min,
    "2010-01-01 03:44"
  );
  assertRange(
    y2010 + 3 * hr + 44 * min + 12 * sec,
    y2010 + 3 * hr + 44 * min + 13 * sec,
    "2010-01-01 03:44:12"
  );
  assertRange(y2011 - sec, y2011, "2010-12-31 23:59:59");

  /* testing date ranges
		entering a date range creates a search centered on now with extended in both directions by the value of the range
		examples:
			given now is 2001-09-09 01:46:40
			"3days" searches from 3 days in the past to 3 days in the future (2001-09-03 01:46:40 -> 2001-09-12 01:46:40)
			"1hr" searches from 1 hour in the past to 1 hour in the future (2001-09-09 00:46:40 -> 2001-09-09 02:46:40)
			"600mins" searches from 10 hours in the past to 10 hours in the future (2001-09-08 15:46:40 -> 2001-09-09 11:46:40)
		note: months are exactly 31 days, and years are 365 days
			this format by it's self is a short cut for anchor + range query with now as the anchor. "now <> 1day" and "1day" are the same
	*/
  assertRange(now - 2 * day, now + 2 * day, "2 days");
  assertRange(now - 2 * day, now + 2 * day, "2day");
  assertRange(now - 3 * sec, now + 3 * sec, "3secs");
  assertRange(now - 31 * min, now + 31 * min, "31mins");
  assertRange(now - 300 * hr, now + 300 * hr, "300h");
  assertRange(now - 300 * hr, now + 300 * hr, "300hr");
  assertRange(now - 300 * hr, now + 300 * hr, "300hrs");
  assertRange(now - 300 * hr, now + 300 * hr, "300hour");
  assertRange(now - 300 * hr, now + 300 * hr, "300hours");
  assertRange(now - 1 * day, now + 1 * day, "1day");
  assertRange(now - 62 * day, now + 62 * day, "2 mon");
  assertRange(now - 3650 * day, now + 3650 * day, "10 yrs");

  /* testing date -> date queries
		entering a date / time / token either before and/or after the "<" / "->" operator (both operators have the same effect) creates a query between the two end points
		if one of the end points is missing, it means no end to the range in that direction
		any of the date specifier formats "2010-01-01" / "13:15:30" / "2010-01-01 13:15:30" / keywords ("now" / "today" / "last year" etc) can be used
		examples:
			"2010 <" searches from the start of 2010 into the future (2010-01-01 00:00:00.000 -> null)
			"< 2010" searches all the past to the end of 2010 (null -> 2010-12-31 23:59:59.999)
			"2000 -> 2010" searches from the start of 2000 to the end of 2010 (2000-01-01 00:00:00.000 -> 2010-12-31 23:59:59.999)
			"last year -> next year" search all of last year, this year and next year
			"2010 -> now" searches the start of 2010 to now
	*/
  assertRange(y2010, now, "2010 -> now");
  assertRange(now, y2021, "now -> 2020");
  assertRange(y2010, now, "2010 < now");
  assertRange(now, y2021, "now < 2020");
  assertRange(nowD - 7 * day, y2021 + day, "lastweek -> 2021-01-01");
  assertRange(null, now, "< now");
  assertRange(nowD + day, null, "tomorrow <");
  assertRange(nowY, null, "this year <");
  assertRange(nowY, null, "this year ->");

  /* testing anchor + range
		entering a date specifier followed by the "<>" range operator followed by a range specifier
		creates search centered on the date extended in both directions by the range
		example
			"2010 <> 2days" searches from the start of 2010 - 2 days to the end of 2010 + 2 days (2009-12-29 00:00:00.000 -> 2011-01-02 23:59:59.999) 
			"2010-01-01 <> 4m" searches from sept 2009 to april 2010 (2009-09-01 00:00:00.000 -> 2010-04-30 23:59:59.999)
		note: due to the way months and years are calculated, the day values will not alway line up (months are always 31 days, years are always 365 days)
	*/
  assertRange(y2010 - 365 * day, y2011 + 365 * day, "2010 <> 1yr");
  assertRange(y2010 - 10 * day, y2011 + 10 * day, "2010 <> 10days");
  assertRange(
    y2010 - 1000 * sec,
    y2010 + day + 1000 * sec,
    "2010-01-01 <> 1000 secs"
  );

  /* test non zerod time ranges */

  drp.now = now + 123;
  // absolute times should zero out milliseconds
  assertRange(now, now + sec, "2001-09-09 01:46:40");
  assertRange(nowD + 3 * hr + 30 * min, nowD + 3 * hr + 31 * min, "3:30");
  assertRange(nowD + day, nowD + 2 * day, "tomorrow");
  // relative times should not zero it out
  assertRange(y2010, now + 123, "2010 -> now");
  assertRange(now - 3 * sec + 123, now + 3 * sec + 123, "3secs");

  drp.now = now;

  /* testing public parse function */
  assertEquals("(parse), start now", now - day, drp.parse("now").start);
  assertEquals("(parse), end now", now + day - 1, drp.parse("now").end);
  assertEquals("(parse), start < now", null, drp.parse("< now").start);
  assertEquals("(parse), end < now", now - 1, drp.parse("< now").end);
  assertEquals("(parse), start now <", now, drp.parse("now <").start);
  assertEquals("(parse), end now <", null, drp.parse("now <").end);

  /* testing failure cases */
  assertEquals("(parse), foo", null, drp.parse("foo"));
  assertEquals("(parse), 2001-09-", null, drp.parse("2001-09-"));
  assertEquals("(parse), 2010 <> 20", null, drp.parse("2010 <> 20"));

  /* testing empty input */
  assertEquals("(parse), start (empty string)", null, drp.parse("").start);
  assertEquals("(parse), end (undefined)", null, drp.parse().end);
};

testParseNumber = function () {
  var drp = datesRangeParser;

  function assertNumberRange(s, e, exp) {
    var r = drp._parseNumber(exp);
    assertEquals("start " + exp, s, r.start);
    assertEquals("end " + exp, e, r.end);
  }

  assertNumberRange(0, 0, "0");
  assertNumberRange(1, 1, "1");
  assertNumberRange(123456, 123456, "123456");
  assertNumberRange(1.5, 1.5, "1.5");
  assertNumberRange(300000, 300000, "3e5");
  assertNumberRange(-88.3, -88.3, "-88.3");
  assertNumberRange(-3200, -3200, "-3.2e3");
  assertNumberRange(0, 100, "0 < 100");
  assertNumberRange(-19, 21, "1 <> 20");
  assertNumberRange(99, 99.999, "99 -> 99.999");
  assertNumberRange(-10, 10, "<> 10");
  assertNumberRange(0, 200, "100 <> 100");
  assertNumberRange(10, 100, "1e1 -> 1e2");
  assertNumberRange(-20000, 20000, "<> 2e4");
  assertNumberRange(null, 5000, "-> 5000");
  assertNumberRange(5000, null, "5000 -> ");
  assertNumberRange(null, 5000, "< 5000");
  assertNumberRange(5000, null, "5000 < ");
};

testParseDateWithTimeZone = function () {
  var drp = datesRangeParser;
  drp.defaultRange = day;
  const tz = "Asia/Karachi"; // Pakistan Standard Time (PST) UTC+5
  const gmtplus5 = 5 * hr;

  drp.TZ = tz;
  drp.UTC = false;

  // TEST TODAY
  // sunday 09 sep 2001 00:00:00 GMT
  var now = 999993600000;
  /* because we are checking today relative to the timezone so let's
   set internal representation of now to a known value of
   sunday 09 sep 2001 18:59:59 GMT, so to make sure even after travelling to
   the target time zone time becomes 23:59:59 GMT+5 and does not change date
  */
  const now1859 = now + 18 * hr + 59 * min + 59 * sec + 999;
  drp.now = now1859;

  const persedToday18 = drp.parse("today").value; // output is in TZ

  const expectedToday18 = {
    from: now - gmtplus5, // 00:00:00 GMT+5 becomes 19:00:00 GMT the previous day 8 sep 2001
    to: now1859, // 23:59:59 GMT+5 becomes 18:59:59 GMT the same day 9 sep 2001
  };
  assertEquals("from", persedToday18.from, expectedToday18.from);
  assertEquals("to", persedToday18.to, expectedToday18.to);

  //================================================================================================
  // TEST TODAY detect change of day in the target timezone
  // sunday 09 sep 2001 19:00:00 GMT becomes monday 10 sep 2001 00:00:00 GMT+5
  // so the range will be start of the day (10th) in the target timezone
  const now1900 = now + 19 * hr;
  drp.now = now1900;

  const persedToday19 = drp.parse("today").value;

  const expectedToday19 = {
    from: now - gmtplus5 + day, // 00:00:00 GMT+5 becomes 19:00:00 GMT the previous day 9 sep 2001
    to: now1859 + day, // 23:59:59 GMT+5 becomes 18:59:59 GMT the same day 10 sep 2001
  };
  assertEquals("from", persedToday19.from, expectedToday19.from);
  assertEquals("to", persedToday19.to, expectedToday19.to);

  //================================================================================================
  // // TEST TOMORROW
  drp.now = now1859;

  const persedTomorrow = drp.parse("tomorrow").value;
  const expectedTomorrow = {
    from: now - gmtplus5 + day, // 00:00:00 GMT+5 becomes 19:00:00 GMT the previous day 9 sep 2001
    to: now1859 + day, // 23:59:59 GMT+5 becomes 18:59:59 GMT the same day 10 sep 2001
  };

  assertEquals("from", persedTomorrow.from, expectedTomorrow.from);
  assertEquals("from", persedTomorrow.to, expectedTomorrow.to);
};

testParseRangeWithTimeZone = function () {
  var drp = datesRangeParser;
  drp.defaultRange = day;
  const tz = "Asia/Karachi";
  const gmtplus5 = 5 * hr;

  drp.TZ = tz;
  drp.UTC = false;

  // TEST TODAY -> TOMORROW
  // sunday 09 sep 2001 00:00:00 GMT
  var now = 999993600000;
  // sunday 09 sep 2001 18:59:59 GMT, 23:59:59 GMT+5
  const now1859 = now + 18 * hr + 59 * min + 59 * sec + 999;
  drp.now = now1859;

  const parsedRange = drp.parse("today -> tomorrow").value;
  const expectedRange = {
    from: now - gmtplus5,
    // to is end of tomorrow in target timezone which is 23:59:59 GMT+5 10 sep 2001
    // it becomes 18:59:59 GMT 10 sep 2001
    to: now1859 + day,
  };

  assertEquals("from", parsedRange.from, expectedRange.from);
  assertEquals("to", parsedRange.to, expectedRange.to);

  //================================================================================================
  // // TEST Next Week
  drp.now = now1859;

  const parsedRangeWeek = drp.parse("tomorrow -> 7day").value;
  const expectedRangeWeek = {
    // tomorrow 10 sep 2001 00:00:00 GMT+5 becomes 9 sep 2001 19:00:00 GMT
    from: now1859 + 1,
    // 7 days from tomorrow 10 sep 2001 00:00:00 GMT+5 becomes 17 sep 2001 00:00:00 GMT
    to: now1859 + day * 8,
  };

  assertEquals("from", parsedRangeWeek.from, expectedRangeWeek.from);
  assertEquals("to", parsedRangeWeek.to, expectedRangeWeek.to);
};

testParseDateWithTimeZone();
testParseRangeWithTimeZone();

// log green result message
console.log("\x1b[32m", "All tests passed!");
