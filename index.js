/*!
 * DatesRangeParser.js
 *    Ahmad Ali
 * fork me at https://github.com/ahmadalibaloch/dates-range-parser

Permission is hereby granted, free of charge, to any person obtaining a copy
of this software and associated documentation files (the "Software"), to deal
in the Software without restriction, including without limitation the rights
to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
copies of the Software, and to permit persons to whom the Software is
furnished to do so, subject to the following conditions:

The above copyright notice and this permission notice shall be included in all
copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE
SOFTWARE.

*/

const drp = {};

drp.UTC = false; // set to true to use UTC dates  (default is local time)

drp.defaultRange = 1000 * 60 * 60 * 24;

drp.now = null; // set a different value for now than the time at function invocation

drp.parse = (v) => {
  if (v === null || v === undefined || v === "" || v === "No filter") {
    return {
      error: "Invalid or empty time range",
    };
  }
  try {
    const r = drp._parseDate(v);
    if (r.end) r.end--; // remove 1 millisecond from the final end range
    return {
      value: {
        from: r.start,
        to: r.end,
        timeRange: v,
      },
    };
  } catch (e) {
    return {
      error: e.message,
    };
  }
};

(() => {
  drp._relTokens = {};

  const values = {
    yr: 365 * 24 * 60 * 60 * 1000,
    mon: 31 * 24 * 60 * 60 * 1000,
    day: 24 * 60 * 60 * 1000,
    hr: 60 * 60 * 1000,
    min: 60 * 1000,
    sec: 1000,
  };

  const aliases = {
    yr: "y,yr,yrs,year,years",
    mon: "mo,mon,mos,mons,month,months",
    day: "d,dy,dys,day,days",
    hr: "h,hr,hrs,hour,hours",
    min: "m,min,mins,minute,minutes",
    sec: "s,sec,secs,second,seconds",
  };

  Object.keys(aliases).forEach((key) => {
    const keyAliases = aliases[key].split(",");
    for (let i = 0; i < keyAliases.length; i++) {
      drp._relTokens[keyAliases[i]] = values[key];
    }
  });
})();

// create an array of date components from a Date
function makeArray(d) {
  const da = new Date(d);
  return drp.UTC
    ? [
        da.getUTCFullYear(),
        da.getUTCMonth() + 1,
        da.getUTCDate(),
        da.getUTCHours(),
        da.getUTCMinutes(),
        da.getUTCSeconds(),
        da.getUTCMilliseconds(),
      ]
    : [
        da.getFullYear(),
        da.getMonth() + 1,
        da.getDate(),
        da.getHours(),
        da.getMinutes(),
        da.getSeconds(),
        da.getMilliseconds(),
      ];
}

// convert an array of date components into a Date
function fromArray(a) {
  const d = [...a];
  d[1]--;
  return drp.UTC
    ? new Date(Date.UTC(...d)).getTime()
    : new Date(...d).getTime();
}

// create an array of date components with all entries with less significance than p (precision) zeroed out.
// an optional offset can be added to p
function precArray(d, p, offset) {
  const tn = makeArray(d);
  tn[p] += offset || 0;
  for (let i = p + 1; i < 7; i++) {
    tn[i] = i < 3 ? 1 : 0;
  }
  return tn;
}

// create a range based on a precision and offset by the range amount
function makePrecRange(dt, p, r) {
  const ret = {};
  ret.start = fromArray(dt);
  // eslint-disable-next-line no-param-reassign
  dt[p] += r || 1;
  ret.end = fromArray(dt);
  return ret;
}

function getRange(op, term1, term2, origin) {
  if (op === "<" || op === "->") {
    if (term1 && !term2) {
      return { start: term1.start, end: null };
    }
    if (!term1 && term2) {
      return { start: null, end: term2.end };
    }
    if (term2.rel) {
      return { start: term1.start, end: term1.end + term2.rel };
    }
    if (term1.rel) {
      return { start: term2.start - term1.rel, end: term2.end };
    }
    return { start: term1.start, end: term2.end };
  }
  if (op === "<>") {
    if (!term2) {
      return {
        start: term1.start - drp.defaultRange,
        end: term1.end + drp.defaultRange,
      };
    }
    if (!("rel" in term2)) {
      throw new Error("second term did not have a range");
    }
    return {
      start: term1.start - term2.rel,
      end: term1.end + term2.rel,
    };
  }
  if (term1.rel) {
    return { start: origin - term1.rel, end: origin + term1.rel };
  }
  if (term1.now) {
    return {
      start: term1.now - drp.defaultRange,
      end: term1.now + drp.defaultRange,
    };
  }
  return { start: term1.start, end: term1.end };
}

function getCurrentQuarterDates() {
  const now = new Date();
  const quarter = Math.floor(now.getMonth() / 3); // Get the current quarter (0, 1, 2, or 3)
  const year = now.getFullYear();

  // Calculate the start date of the quarter
  const startMonth = quarter * 3;
  const startDate = new Date(year, startMonth, 1);

  // Calculate the end date of the quarter
  const endMonth = startMonth + 2;
  const endDate = new Date(year, endMonth + 1, 0);

  return { start: startDate, end: endDate };
}

function getNextQuarterDates() {
  const now = new Date();
  const currentQuarter = Math.floor(now.getMonth() / 3); // Get the current quarter (0, 1, 2, or 3)
  const nextQuarter = (currentQuarter + 1) % 4; // Calculate the next quarter (0, 1, 2, or 3)
  const year = now.getFullYear();

  // Calculate the start date of the next quarter
  const startMonth = nextQuarter * 3;
  const startDate = new Date(year, startMonth, 1);

  // Calculate the end date of the next quarter
  const endMonth = startMonth + 2;
  const endDate = new Date(year, endMonth + 1, 0);

  return { start: startDate, end: endDate };
}

function getPreviousQuarterDates() {
  const now = new Date();
  const currentQuarter = Math.floor(now.getMonth() / 3); // Get the current quarter (0, 1, 2, or 3)
  const previousQuarter = (currentQuarter - 1 + 4) % 4; // Calculate the previous quarter (0, 1, 2, or 3)
  const year = now.getFullYear();

  // Calculate the start date of the previous quarter
  const startMonth = previousQuarter * 3;
  const startDate = new Date(year, startMonth, 1);

  // Calculate the end date of the previous quarter
  const endMonth = startMonth + 2;
  const endDate = new Date(year, endMonth + 1, 0);

  return { start: startDate, end: endDate };
}

function procTerm(term, origin) {
  const m = term
    .replace(/\s/g, "")
    .toLowerCase()
    .match(/^([a-z ]+)$|^([ 0-9:-]+)$|^(\d+[a-z]+)$/);
  if (m[1]) {
    // eslint-disable-next-line no-inner-declarations
    function dra(p, o, r) {
      const dt = precArray(origin, p, o);
      if (r) {
        dt[2] -= drp.UTC
          ? new Date(fromArray(dt)).getUTCDay()
          : new Date(fromArray(dt)).getDay();
      }
      return makePrecRange(dt, p, r);
    }
    // eslint-disable-next-line default-case
    switch (m[1]) {
      case "now":
        return { start: origin, end: origin, now: origin };
      case "today":
        return dra(2, 0);
      case "thisweek":
        return dra(2, 0, 7);
      case "thismonth":
        return dra(1, 0);
      case "thisyear":
        return dra(0, 0);
      case "yesterday":
        return dra(2, -1);
      case "lastweek":
        return dra(2, -7, 7);
      case "lastmonth":
        return dra(1, -1);
      case "lastyear":
        return dra(0, -1);
      case "tomorrow":
        return dra(2, 1);
      case "nextweek":
        return dra(2, 7, 7);
      case "nextmonth":
        return dra(1, 1);
      case "nextyear":
        return dra(0, 1);
      case "thisquarter":
        return getCurrentQuarterDates();
      case "lastquarter":
        return getPreviousQuarterDates();
      case "nextquarter":
        return getNextQuarterDates();
    }
    // eslint-disable-next-line no-throw-literal
    throw `unknown token ${m[1]}`;
  } else if (m[2]) {
    const dn = makeArray(origin);
    const dt = m[2].match(
      /^(?:(\d{4})(?:-(\d\d))?(?:-(\d\d)))? ?(?:(\d{1,2})(?::(\d\d)(?::(\d\d))))?$/
    );
    dt.shift();
    for (let p = 0, z = false, i = 0; i < 7; i++) {
      if (dt[i]) {
        dn[i] = parseInt(dt[i], 10);
        // eslint-disable-next-line no-unused-vars
        p = i;
        z = true;
      } else if (z) dn[i] = i < 3 ? 1 : 0;
    }
    // eslint-disable-next-line no-undef
    return makePrecRange(dn, p);
  } else if (m[3]) {
    const dr = m[3].match(/(\d+)\s*([a-z]+)/i);
    const n = parseInt(dr[1], 10);
    return { rel: n * drp._relTokens[dr[2]] };
  }
  // eslint-disable-next-line no-throw-literal
  throw `unknown term ${term}`;
}

drp._parseDate = function parseDate(v) {
  const now = this.now || new Date().getTime();

  if (!v) {
    return { start: null, end: null };
  }
  const terms = v.split(/\s*([^<>]*[^<>-])?\s*(->|<>|<)?\s*([^<>]+)?\s*/);

  const term1 = terms[1] ? procTerm(terms[1], now) : null;
  const op = terms[2] || "";
  const term2 = terms[3] ? procTerm(terms[3], now) : null;

  return getRange(op, term1, term2, now);
};

module.exports = drp;
