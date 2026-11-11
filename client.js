window.__ModuleLoader__.load({
  id: 'dsh-early-sleep-calendar',
  factory(require) {
    'use strict';

    const React = require('react');
    const h = React.createElement;

    const NS = 'early-sleep-calendar';
    const PANEL_ID = 'early-sleep';
    const ROUTE = 'api/early-sleep/records';
    const SIDEBAR_ORDER = 70;
    const DEFAULT_TIME = '23:00';

    // ── Dictionaries ─────────────────────────────────────────────────────────
    const DICT_ZH = {
      'nav.label': '早睡打卡',
      'panel.title': '早睡打卡日历',
      'panel.subtitle': '在日历上记录每一天的早睡打卡，支持按月、按年回顾。',
      'view.month': '月',
      'view.year': '年',
      'view.aria': '视图切换',
      'nav.today': '今天',
      'nav.prevMonth': '上个月',
      'nav.nextMonth': '下个月',
      'nav.prevYear': '上一年',
      'nav.nextYear': '下一年',
      'stats.total': '累计早睡',
      'stats.streak': '连续早睡',
      'stats.longest': '最长连续',
      'stats.month': '本月早睡',
      'stats.days': '{n} 天',
      'stats.failed': '超过午夜 {n} 天',
      'quick.checkin': '今晚早睡打卡',
      'quick.checked': '今天已打卡',
      'editor.title.new': '添加早睡记录',
      'editor.title.edit': '编辑早睡记录',
      'editor.time': '入睡时间',
      'editor.note': '备注',
      'editor.notePlaceholder': '想写点什么…',
      'editor.save': '保存打卡',
      'editor.update': '更新打卡',
      'editor.delete': '删除记录',
      'editor.close': '关闭',
      'editor.saving': '保存中…',
      'editor.savedAt': '记录于 {time}',
      'editor.deleteConfirm': '确定删除 {date} 的打卡记录吗？',
      'editor.lateHint': '超过午夜 0 点入睡，这条记录将记为早睡失败，不计入连续天数。',
      'editor.successHint': '午夜 0 点前入睡，记为早睡成功。',
      'panel.loading': '正在读取打卡记录…',
      'panel.errorTitle': '无法读取打卡记录',
      'panel.retry': '重试',
      'panel.empty': '这个月还没有早睡记录，点击任意一天开始打卡吧。',
      'footer.count': '共 {n} 条记录（{failed} 条超过午夜，记为失败）',
      'week.0': '一',
      'week.1': '二',
      'week.2': '三',
      'week.3': '四',
      'week.4': '五',
      'week.5': '六',
      'week.6': '日',
      'year.monthsAria': '年度总览',
    };

    const DICT_EN = {
      'nav.label': 'Early sleep',
      'panel.title': 'Early sleep calendar',
      'panel.subtitle': 'Check in your early-sleep days on a calendar, reviewed by month or by year.',
      'view.month': 'Month',
      'view.year': 'Year',
      'view.aria': 'Calendar view',
      'nav.today': 'Today',
      'nav.prevMonth': 'Previous month',
      'nav.nextMonth': 'Next month',
      'nav.prevYear': 'Previous year',
      'nav.nextYear': 'Next year',
      'stats.total': 'Successful nights',
      'stats.streak': 'Current streak',
      'stats.longest': 'Longest streak',
      'stats.month': 'This month',
      'stats.days': '{n} days',
      'stats.failed': '{n} past midnight',
      'quick.checkin': 'Check in tonight',
      'quick.checked': 'Checked in today',
      'editor.title.new': 'Add sleep record',
      'editor.title.edit': 'Edit sleep record',
      'editor.time': 'Bedtime',
      'editor.note': 'Note',
      'editor.notePlaceholder': 'Say something…',
      'editor.save': 'Save check-in',
      'editor.update': 'Update check-in',
      'editor.delete': 'Delete record',
      'editor.close': 'Close',
      'editor.saving': 'Saving…',
      'editor.savedAt': 'Recorded {time}',
      'editor.deleteConfirm': 'Delete the check-in for {date}?',
      'editor.lateHint': 'Falling asleep past midnight counts as a failed early-sleep night and is excluded from streaks.',
      'editor.successHint': 'Asleep before midnight counts as a successful early-sleep night.',
      'panel.loading': 'Reading check-ins…',
      'panel.errorTitle': 'Could not read check-ins',
      'panel.retry': 'Retry',
      'panel.empty': 'No early-sleep records this month yet — click any day to check in.',
      'footer.count': '{n} records ({failed} past midnight, counted as failed)',
      'week.0': 'Mon',
      'week.1': 'Tue',
      'week.2': 'Wed',
      'week.3': 'Thu',
      'week.4': 'Fri',
      'week.5': 'Sat',
      'week.6': 'Sun',
      'year.monthsAria': 'Year overview',
    };

    // ── Styles ───────────────────────────────────────────────────────────────
    const STYLE_CSS = `
.es-root{box-sizing:border-box;height:100%;overflow-y:auto;background:var(--dsw-alias-bg-base);color:var(--dsw-alias-label-primary);font-family:inherit;font-size:var(--dsh-content-font-size-secondary,13px);line-height:calc(20px + var(--dsh-content-font-delta-secondary,0px))}
.es-content{box-sizing:border-box;width:100%;max-width:960px;margin:0 auto;padding:28px clamp(20px,3vw,40px) 48px;display:flex;flex-direction:column;gap:20px}
[data-platform='darwin'] .es-content{padding-top:calc(28px + var(--dsh-frame-top-clearance,0px))}
.es-headRow{display:flex;flex-wrap:wrap;align-items:flex-end;justify-content:space-between;gap:12px}
.es-heading{min-width:0}
.es-title{margin:0;font-size:20px;font-weight:500;line-height:28px;letter-spacing:-.01em}
.es-sub{margin:4px 0 0;color:var(--dsw-alias-label-secondary);font-size:var(--dsh-content-font-size-secondary,13px);line-height:20px;max-width:68ch}
.es-headRight{display:flex;flex-wrap:wrap;align-items:center;gap:8px}
.es-tabs{display:inline-flex;align-items:center;gap:2px;padding:2px;border-radius:999px;background:var(--dsw-alias-interactive-bg-hover)}
.es-tab{box-sizing:border-box;appearance:none;font:inherit;font-size:12px;line-height:18px;color:var(--dsw-alias-label-secondary);background:0 0;border:1px solid transparent;border-radius:999px;padding:3px 12px;cursor:pointer;white-space:nowrap;transition:background-color .2s var(--ds-ease-in-out,ease),color .2s var(--ds-ease-in-out,ease),border-color .2s var(--ds-ease-in-out,ease)}
.es-tab:hover{background:var(--dsw-alias-interactive-bg-hover-solid);color:var(--dsw-alias-label-primary)}
.es-tab[aria-pressed='true']{background:var(--dsw-alias-bg-layer-2);border-color:var(--dsw-alias-border-l2);color:var(--dsw-alias-label-primary);box-shadow:var(--dsw-shadow-lv1,none)}
.es-btn{box-sizing:border-box;display:inline-flex;align-items:center;gap:6px;font:inherit;font-size:12px;line-height:18px;color:var(--dsw-alias-label-secondary);background:var(--dsw-alias-bg-layer-2);border:1px solid var(--dsw-alias-border-l2);border-radius:999px;padding:4px 12px;cursor:pointer;white-space:nowrap;transition:background-color .2s var(--ds-ease-in-out,ease),color .2s var(--ds-ease-in-out,ease),border-color .2s var(--ds-ease-in-out,ease)}
.es-btn:hover:not(:disabled){background:var(--dsw-alias-interactive-bg-hover);border-color:var(--dsw-alias-label-secondary);color:var(--dsw-alias-label-primary)}
.es-btn:active:not(:disabled){background:var(--dsw-alias-interactive-bg-active)}
.es-btn:disabled{opacity:.5;cursor:default}
.es-btnPrimary{background:var(--dsw-alias-button-primary-fill);border-color:transparent;color:var(--dsw-alias-label-primary-foreground)}
.es-btnPrimary:hover:not(:disabled){background:var(--dsw-alias-button-primary-hover);border-color:transparent;color:var(--dsw-alias-label-primary-foreground)}
.es-btnDanger{color:var(--dsw-alias-state-error-primary)}
.es-btnDanger:hover:not(:disabled){border-color:var(--dsw-alias-state-error-primary);color:var(--dsw-alias-state-error-primary)}
.es-stats{display:grid;grid-template-columns:repeat(auto-fit,minmax(min(140px,100%),1fr));gap:12px}
.es-stat{box-sizing:border-box;min-width:0;background:var(--dsw-alias-bg-layer-2);border:1px solid var(--dsw-alias-border-l2);border-radius:var(--dsw-radius-lg,16px);padding:14px 18px;box-shadow:var(--dsw-shadow-lv1,none)}
.es-statLabel{color:var(--dsw-alias-label-tertiary);font-size:11px;line-height:16px}
.es-statValue{margin-top:2px;font-size:24px;line-height:30px;font-weight:500;font-variant-numeric:tabular-nums;letter-spacing:-.01em}
.es-statValueUnit{color:var(--dsw-alias-label-tertiary);font-size:12px;font-weight:400;margin-left:4px}
.es-card{box-sizing:border-box;min-width:0;background:var(--dsw-alias-bg-layer-2);border:1px solid var(--dsw-alias-border-l2);border-radius:var(--dsw-radius-lg,16px);padding:16px 20px;box-shadow:var(--dsw-shadow-lv1,none)}
.es-calHead{display:flex;flex-wrap:wrap;align-items:center;justify-content:space-between;gap:8px;margin-bottom:12px}
.es-calTitle{margin:0;font-size:15px;font-weight:500;line-height:22px;font-variant-numeric:tabular-nums}
.es-calNav{display:flex;align-items:center;gap:6px}
.es-navBtn{box-sizing:border-box;display:inline-flex;align-items:center;justify-content:center;width:26px;height:26px;font:inherit;color:var(--dsw-alias-label-secondary);background:0 0;border:1px solid var(--dsw-alias-border-l2);border-radius:999px;cursor:pointer;transition:background-color .2s var(--ds-ease-in-out,ease),color .2s var(--ds-ease-in-out,ease)}
.es-navBtn:hover{background:var(--dsw-alias-interactive-bg-hover);color:var(--dsw-alias-label-primary)}
.es-weekRow{display:grid;grid-template-columns:repeat(7,1fr);gap:4px;margin-bottom:4px}
.es-weekCell{text-align:center;color:var(--dsw-alias-label-tertiary);font-size:11px;line-height:16px;padding:2px 0}
.es-grid{display:grid;grid-template-columns:repeat(7,1fr);gap:4px}
.es-day{box-sizing:border-box;position:relative;display:flex;flex-direction:column;align-items:flex-start;gap:2px;min-height:64px;padding:6px 8px;font:inherit;text-align:left;background:0 0;border:1px solid transparent;border-radius:var(--dsw-radius-md,12px);cursor:pointer;transition:background-color .2s var(--ds-ease-in-out,ease),border-color .2s var(--ds-ease-in-out,ease)}
.es-day:hover{background:var(--dsw-alias-interactive-bg-hover)}
.es-dayNum{font-size:13px;line-height:18px;font-variant-numeric:tabular-nums;color:var(--dsw-alias-label-primary)}
.es-dayOutside .es-dayNum{color:var(--dsw-alias-label-quaternary,var(--dsw-alias-label-tertiary))}
.es-dayToday .es-dayNum{display:inline-flex;align-items:center;justify-content:center;min-width:20px;height:20px;border-radius:999px;background:var(--dsw-alias-brand-primary);color:var(--dsw-alias-label-primary-foreground);font-weight:500}
.es-dayRecorded{background:color-mix(in srgb,var(--dsw-alias-brand-primary) 10%,transparent)}
.es-dayRecorded:hover{background:color-mix(in srgb,var(--dsw-alias-brand-primary) 16%,transparent)}
.es-dayFailed{background:color-mix(in srgb,var(--dsw-alias-state-warn-primary) 10%,transparent)}
.es-dayFailed:hover{background:color-mix(in srgb,var(--dsw-alias-state-warn-primary) 16%,transparent)}
.es-dayFailed .es-dayMoon{color:var(--dsw-alias-state-warn-primary)}
.es-daySelected{border-color:var(--dsw-alias-brand-primary)}
.es-dayMoon{display:inline-flex;align-items:center;gap:3px;color:var(--dsw-alias-brand-primary)}
.es-dayTime{font-size:10px;line-height:14px;font-variant-numeric:tabular-nums;color:var(--dsw-alias-label-tertiary)}
.es-dayNote{margin-top:auto;width:100%;font-size:10px;line-height:14px;color:var(--dsw-alias-label-tertiary);white-space:nowrap;overflow:hidden;text-overflow:ellipsis}
.es-calEmpty{margin-top:12px;color:var(--dsw-alias-label-tertiary);font-size:12px;line-height:18px}
.es-yearGrid{display:grid;grid-template-columns:repeat(auto-fit,minmax(min(200px,100%),1fr));gap:12px}
.es-miniMonth{box-sizing:border-box;padding:12px;border:1px solid var(--dsw-alias-border-l1);border-radius:var(--dsw-radius-md,12px)}
.es-miniTitle{margin:0 0 6px;font-size:12px;font-weight:500;line-height:18px;color:var(--dsw-alias-label-secondary)}
.es-miniGrid{display:grid;grid-template-columns:repeat(7,1fr);gap:2px}
.es-miniDay{box-sizing:border-box;appearance:none;font:inherit;display:flex;align-items:center;justify-content:center;aspect-ratio:1;font-size:10px;line-height:1;font-variant-numeric:tabular-nums;color:var(--dsw-alias-label-tertiary);background:0 0;border:1px solid transparent;border-radius:6px;cursor:pointer;padding:0;transition:background-color .2s var(--ds-ease-in-out,ease)}
.es-miniDay:hover{background:var(--dsw-alias-interactive-bg-hover)}
.es-miniDayRecorded{background:var(--dsw-alias-brand-primary);color:var(--dsw-alias-label-primary-foreground);font-weight:500}
.es-miniDayRecorded:hover{background:var(--dsw-alias-brand-primary)}
.es-miniDayFailed{background:var(--dsw-alias-state-warn-primary);color:var(--dsw-alias-label-primary-foreground);font-weight:500}
.es-miniDayFailed:hover{background:var(--dsw-alias-state-warn-primary)}
.es-miniDayToday{border-color:var(--dsw-alias-brand-primary)}
.es-miniDayEmpty{cursor:default;background:0 0}
.es-miniDayEmpty:hover{background:0 0}
.es-editor{display:flex;flex-direction:column;gap:12px}
.es-editorHead{display:flex;align-items:center;justify-content:space-between;gap:8px}
.es-editorTitle{margin:0;font-size:14px;font-weight:500;line-height:20px}
.es-editorDate{color:var(--dsw-alias-brand-primary);font-variant-numeric:tabular-nums}
.es-editorMeta{color:var(--dsw-alias-label-tertiary);font-size:11px;line-height:16px}
.es-fieldRow{display:flex;flex-wrap:wrap;gap:12px}
.es-field{display:flex;flex-direction:column;gap:4px;min-width:0}
.es-fieldGrow{flex:1 1 220px}
.es-fieldLabel{color:var(--dsw-alias-label-tertiary);font-size:11px;line-height:16px}
.es-input{box-sizing:border-box;font:inherit;font-size:13px;line-height:20px;color:var(--dsw-alias-label-primary);background:var(--dsw-alias-bg-base);border:1px solid var(--dsw-alias-border-l2);border-radius:var(--dsw-radius-sm,8px);padding:5px 10px;width:100%}
.es-input:focus{outline:var(--dsw-focus-ring-width,2px) solid var(--dsw-focus-ring-color,var(--dsw-alias-state-business-primary));outline-offset:0;border-color:transparent}
.es-editorActions{display:flex;flex-wrap:wrap;align-items:center;gap:8px}
.es-editorSpacer{flex:1 1 auto}
.es-errorCard{display:flex;flex-direction:column;align-items:flex-start;gap:12px}
.es-errorHead{display:flex;align-items:center;gap:8px}
.es-errorDot{width:8px;height:8px;border-radius:50%;background:var(--dsw-alias-state-error-primary);flex:none}
.es-errorTitle{margin:0;font-size:14px;font-weight:500;line-height:20px}
.es-errorText{margin:0;color:var(--dsw-alias-label-secondary);font-size:12px;line-height:18px;overflow-wrap:anywhere}
.es-lateHint{margin:0;color:var(--dsw-alias-state-warn-primary);font-size:11px;line-height:16px}
.es-loadingCard{display:flex;flex-direction:column;gap:8px}
.es-loadingRow{display:flex;align-items:center;gap:8px;color:var(--dsw-alias-label-secondary);font-size:12px;line-height:18px}
.es-loadingDot{width:7px;height:7px;border-radius:50%;background:var(--dsw-alias-label-tertiary);flex:none}
.es-skeleton{height:12px;border-radius:var(--dsw-radius-xs,4px);background:var(--dsw-alias-bg-skeleton)}
.es-foot{color:var(--dsw-alias-label-tertiary);font-size:11px;line-height:16px;padding:0 2px}
.es-root button:focus-visible{outline:var(--dsw-focus-ring-width,2px) solid var(--dsw-focus-ring-color,var(--dsw-alias-state-business-primary));outline-offset:1px}
@media (prefers-reduced-motion:reduce){.es-root,.es-root *{transition:none!important;animation:none!important}}
`;

    // ── Date helpers ─────────────────────────────────────────────────────────
    function pad2(value) {
      return value < 10 ? '0' + value : String(value);
    }

    function dateKey(year, monthIndex, day) {
      return year + '-' + pad2(monthIndex + 1) + '-' + pad2(day);
    }

    function parseKey(key) {
      return {
        year: Number(key.slice(0, 4)),
        monthIndex: Number(key.slice(5, 7)) - 1,
        day: Number(key.slice(8, 10)),
      };
    }

    function todayKey() {
      const now = new Date();
      return dateKey(now.getFullYear(), now.getMonth(), now.getDate());
    }

    function keyToOrdinal(key) {
      const parts = parseKey(key);
      return Math.round(Date.UTC(parts.year, parts.monthIndex, parts.day) / 86400000);
    }

    function ordinalToKey(ordinal) {
      const date = new Date(ordinal * 86400000);
      return (
        date.getUTCFullYear() + '-' + pad2(date.getUTCMonth() + 1) + '-' + pad2(date.getUTCDate())
      );
    }

    /** 42 cells (6 weeks) starting Monday; each cell has its key and in-month flag. */
    function buildMonthMatrix(year, monthIndex) {
      const first = new Date(year, monthIndex, 1);
      const lead = (first.getDay() + 6) % 7;
      const start = new Date(year, monthIndex, 1 - lead);
      const cells = [];
      for (let index = 0; index < 42; index += 1) {
        const day = new Date(start.getFullYear(), start.getMonth(), start.getDate() + index);
        cells.push({
          key: dateKey(day.getFullYear(), day.getMonth(), day.getDate()),
          day: day.getDate(),
          inMonth: day.getMonth() === monthIndex,
        });
      }
      return cells;
    }

    /** Day cells of one month padded to whole weeks with nulls, Monday start. */
    function buildMiniMonth(year, monthIndex) {
      const first = new Date(year, monthIndex, 1);
      const lead = (first.getDay() + 6) % 7;
      const count = new Date(year, monthIndex + 1, 0).getDate();
      const cells = [];
      for (let index = 0; index < lead; index += 1) cells.push(null);
      for (let day = 1; day <= count; day += 1) cells.push(dateKey(year, monthIndex, day));
      while (cells.length % 7 !== 0) cells.push(null);
      return cells;
    }

    /**
     * Failure rule: a bedtime from 00:00 through 11:59 means the person fell
     * asleep past midnight, so the night does not count as an early sleep.
     * Evening times (12:00–23:59) count as successful.
     */
    function isLateTime(time) {
      if (typeof time !== 'string') return false;
      const parts = time.split(':');
      if (parts.length !== 2) return false;
      const hours = Number(parts[0]);
      const minutes = Number(parts[1]);
      if (!Number.isFinite(hours) || !Number.isFinite(minutes)) return false;
      return hours * 60 + minutes < 12 * 60;
    }

    function isLateRecord(record) {
      return Boolean(record) && isLateTime(record.time);
    }

    function computeStreaks(recordSet, today) {
      const todayOrdinal = keyToOrdinal(today);
      let start = null;
      if (recordSet.has(today)) start = todayOrdinal;
      else if (recordSet.has(ordinalToKey(todayOrdinal - 1))) start = todayOrdinal - 1;
      let current = 0;
      if (start !== null) {
        let cursor = start;
        while (recordSet.has(ordinalToKey(cursor))) {
          current += 1;
          cursor -= 1;
        }
      }
      let longest = 0;
      let run = 0;
      let previous = null;
      const sorted = [...recordSet].sort();
      for (const key of sorted) {
        const ordinal = keyToOrdinal(key);
        run = previous !== null && ordinal === previous + 1 ? run + 1 : 1;
        if (run > longest) longest = run;
        previous = ordinal;
      }
      return { current, longest };
    }

    function monthLabel(year, monthIndex, lang) {
      try {
        return new Intl.DateTimeFormat(lang === 'zh' ? 'zh-CN' : 'en-US', {
          year: 'numeric',
          month: 'long',
        }).format(new Date(year, monthIndex, 1));
      } catch (error) {
        return year + '-' + pad2(monthIndex + 1);
      }
    }

    function miniMonthLabel(monthIndex, lang) {
      try {
        return new Intl.DateTimeFormat(lang === 'zh' ? 'zh-CN' : 'en-US', { month: 'long' }).format(
          new Date(2026, monthIndex, 1),
        );
      } catch (error) {
        return pad2(monthIndex + 1);
      }
    }

    function formatDateLong(key, lang) {
      try {
        const parts = parseKey(key);
        return new Intl.DateTimeFormat(lang === 'zh' ? 'zh-CN' : 'en-US', {
          year: 'numeric',
          month: 'long',
          day: 'numeric',
          weekday: 'long',
        }).format(new Date(parts.year, parts.monthIndex, parts.day));
      } catch (error) {
        return key;
      }
    }

    function formatTime(ms, lang) {
      try {
        return new Intl.DateTimeFormat(lang === 'zh' ? 'zh-CN' : 'en-US', {
          month: 'short',
          day: 'numeric',
          hour: '2-digit',
          minute: '2-digit',
        }).format(new Date(ms));
      } catch (error) {
        return '';
      }
    }

    // ── Data hook ────────────────────────────────────────────────────────────
    function useRecords() {
      const [snapshot, setSnapshot] = React.useState({ records: null, error: null, status: 'loading' });
      const [tick, setTick] = React.useState(0);
      const [mutating, setMutating] = React.useState(false);
      const [mutationError, setMutationError] = React.useState(null);

      const reload = React.useCallback(function () {
        setTick(function (value) {
          return value + 1;
        });
      }, []);

      React.useEffect(
        function () {
          let alive = true;
          let controller = null;
          try {
            controller = typeof AbortController === 'function' ? new AbortController() : null;
          } catch (error) {
            controller = null;
          }
          setSnapshot(function (previous) {
            return {
              records: previous.records,
              error: null,
              status: previous.records ? 'refreshing' : 'loading',
            };
          });
          fetch(ROUTE, {
            method: 'GET',
            credentials: 'same-origin',
            headers: { accept: 'application/json' },
            signal: controller ? controller.signal : undefined,
          })
            .then(function (response) {
              if (!response || !response.ok) {
                throw new Error(response ? 'HTTP ' + response.status : 'Network error');
              }
              return response.json();
            })
            .then(function (payload) {
              if (!alive) return;
              if (!payload || payload.ok === false || !Array.isArray(payload.records)) {
                const message =
                  payload && payload.error && typeof payload.error.message === 'string'
                    ? payload.error.message
                    : '';
                setSnapshot(function (previous) {
                  return { records: previous.records, error: message, status: 'error' };
                });
                return;
              }
              setSnapshot({ records: payload.records, error: null, status: 'ready' });
            })
            .catch(function (error) {
              if (!alive) return;
              if (error && error.name === 'AbortError') return;
              const message = error && typeof error.message === 'string' ? error.message : '';
              setSnapshot(function (previous) {
                return { records: previous.records, error: message, status: 'error' };
              });
            });
          return function () {
            alive = false;
            if (controller) {
              try {
                controller.abort();
              } catch (error) {
                /* ignore a failing abort */
              }
            }
          };
        },
        [tick],
      );

      const applyPayload = React.useCallback(function (payload) {
        if (payload && payload.ok === true && Array.isArray(payload.records)) {
          setMutationError(null);
          setSnapshot({ records: payload.records, error: null, status: 'ready' });
          return true;
        }
        const message =
          payload && payload.error && typeof payload.error.message === 'string'
            ? payload.error.message
            : 'Unexpected response';
        setMutationError(message);
        return false;
      }, []);

      const save = React.useCallback(
        function (date, time, note) {
          setMutating(true);
          setMutationError(null);
          return fetch(ROUTE, {
            method: 'POST',
            credentials: 'same-origin',
            headers: { accept: 'application/json', 'content-type': 'application/json' },
            body: JSON.stringify({ date: date, time: time, note: note }),
          })
            .then(function (response) {
              if (!response || !response.ok) throw new Error(response ? 'HTTP ' + response.status : 'Network error');
              return response.json();
            })
            .then(function (payload) {
              return applyPayload(payload);
            })
            .catch(function (error) {
              setMutationError(error && typeof error.message === 'string' ? error.message : 'Request failed');
              return false;
            })
            .finally(function () {
              setMutating(false);
            });
        },
        [applyPayload],
      );

      const remove = React.useCallback(
        function (date) {
          setMutating(true);
          setMutationError(null);
          return fetch(ROUTE + '?date=' + encodeURIComponent(date), {
            method: 'DELETE',
            credentials: 'same-origin',
            headers: { accept: 'application/json' },
          })
            .then(function (response) {
              if (!response || !response.ok) throw new Error(response ? 'HTTP ' + response.status : 'Network error');
              return response.json();
            })
            .then(function (payload) {
              return applyPayload(payload);
            })
            .catch(function (error) {
              setMutationError(error && typeof error.message === 'string' ? error.message : 'Request failed');
              return false;
            })
            .finally(function () {
              setMutating(false);
            });
        },
        [applyPayload],
      );

      return {
        state: snapshot.status === 'refreshing' ? 'ready' : snapshot.status,
        records: snapshot.records,
        error: snapshot.error,
        reload: reload,
        save: save,
        remove: remove,
        mutating: mutating,
        mutationError: mutationError,
      };
    }

    // ── Shared view pieces ───────────────────────────────────────────────────
    function Styles() {
      return h('style', { 'data-early-sleep-style': NS }, STYLE_CSS);
    }

    function MoonGlyph(props) {
      const size = props && typeof props.size === 'number' ? props.size : 14;
      return h(
        'svg',
        {
          width: size,
          height: size,
          viewBox: '0 0 16 16',
          fill: 'none',
          'aria-hidden': 'true',
          focusable: 'false',
          style: { display: 'block' },
        },
        h('path', {
          d: 'M13.2 9.9A5.8 5.8 0 0 1 6.1 2.8a5.8 5.8 0 1 0 7.1 7.1Z',
          fill: 'currentColor',
        }),
      );
    }

    function SidebarIcon(props) {
      const size = props && typeof props.size === 'number' && props.size > 0 ? props.size : 18;
      return h(
        'svg',
        {
          width: size,
          height: size,
          viewBox: '0 0 20 20',
          fill: 'none',
          xmlns: 'http://www.w3.org/2000/svg',
          'aria-hidden': 'true',
          focusable: 'false',
          style: { display: 'block' },
        },
        h('path', {
          d: 'M15.8 12.2A6.8 6.8 0 0 1 7.8 4.2a6.8 6.8 0 1 0 8 8Z',
          fill: 'currentColor',
          opacity: 0.9,
        }),
        h('path', {
          d: 'M13.6 3.4l.8 1.7 1.7.8-1.7.8-.8 1.7-.8-1.7-1.7-.8 1.7-.8.8-1.7Z',
          fill: 'currentColor',
          opacity: 0.6,
        }),
      );
    }

    // ── Stats bar ────────────────────────────────────────────────────────────
    function StatCard(label, value) {
      return h(
        'div',
        { className: 'es-stat', key: 'stat-' + label },
        h('div', { className: 'es-statLabel' }, label),
        h('div', { className: 'es-statValue' }, value),
      );
    }

    function StatsBar(props) {
      const t = props.t;
      const stats = props.stats;
      return h(
        'div',
        { className: 'es-stats' },
        StatCard(t('stats.total'), t('stats.days', { n: stats.total })),
        StatCard(t('stats.streak'), t('stats.days', { n: stats.current })),
        StatCard(t('stats.longest'), t('stats.days', { n: stats.longest })),
        StatCard(t('stats.month'), t('stats.days', { n: stats.monthCount })),
      );
    }

    // ── Month view ───────────────────────────────────────────────────────────
    function MonthView(props) {
      const t = props.t;
      const recordMap = props.recordMap;
      const today = props.today;
      const cells = React.useMemo(
        function () {
          return buildMonthMatrix(props.year, props.monthIndex);
        },
        [props.year, props.monthIndex],
      );
      const monthCount = cells.filter(function (cell) {
        return cell.inMonth && recordMap.has(cell.key);
      }).length;

      return h(
        React.Fragment,
        null,
        h(
          'div',
          { className: 'es-weekRow' },
          [0, 1, 2, 3, 4, 5, 6].map(function (weekday) {
            return h('div', { className: 'es-weekCell', key: 'w' + weekday }, t('week.' + weekday));
          }),
        ),
        h(
          'div',
          { className: 'es-grid', role: 'grid', 'data-early-sleep-month': '' },
          cells.map(function (cell) {
            const record = recordMap.get(cell.key);
            const late = isLateRecord(record);
            const classes = ['es-day'];
            if (!cell.inMonth) classes.push('es-dayOutside');
            if (cell.key === today) classes.push('es-dayToday');
            if (record) classes.push(late ? 'es-dayFailed' : 'es-dayRecorded');
            if (cell.key === props.selectedDate) classes.push('es-daySelected');
            return h(
              'button',
              {
                key: cell.key,
                type: 'button',
                className: classes.join(' '),
                'data-date': cell.key,
                'aria-pressed': cell.key === props.selectedDate,
                onClick: function () {
                  props.onSelect(cell.key);
                },
              },
              h('span', { className: 'es-dayNum' }, String(cell.day)),
              record
                ? h(
                    'span',
                    { className: 'es-dayMoon' },
                    h(MoonGlyph, { size: 12 }),
                    h('span', { className: 'es-dayTime' }, record.time),
                  )
                : null,
              record && record.note
                ? h('span', { className: 'es-dayNote', title: record.note }, record.note)
                : null,
            );
          }),
        ),
        monthCount === 0 ? h('div', { className: 'es-calEmpty' }, t('panel.empty')) : null,
      );
    }

    // ── Year view ────────────────────────────────────────────────────────────
    function MiniMonth(props) {
      const recordMap = props.recordMap;
      const today = props.today;
      const cells = React.useMemo(
        function () {
          return buildMiniMonth(props.year, props.monthIndex);
        },
        [props.year, props.monthIndex],
      );
      return h(
        'div',
        { className: 'es-miniMonth' },
        h('h3', { className: 'es-miniTitle' }, miniMonthLabel(props.monthIndex, props.lang)),
        h(
          'div',
          { className: 'es-miniGrid' },
          cells.map(function (key, index) {
            if (key === null) {
              return h('span', { key: 'x' + index, className: 'es-miniDay es-miniDayEmpty' });
            }
            const record = recordMap.get(key);
            const recorded = Boolean(record);
            const classes = ['es-miniDay'];
            if (recorded) classes.push(isLateRecord(record) ? 'es-miniDayFailed' : 'es-miniDayRecorded');
            if (key === today) classes.push('es-miniDayToday');
            return h(
              'button',
              {
                key: key,
                type: 'button',
                className: classes.join(' '),
                'data-date': key,
                title: recorded ? key + ' · ' + recordMap.get(key).time : key,
                onClick: function () {
                  props.onOpen(key);
                },
              },
              String(parseKey(key).day),
            );
          }),
        ),
      );
    }

    function YearView(props) {
      const months = [];
      for (let monthIndex = 0; monthIndex < 12; monthIndex += 1) {
        months.push(
          h(MiniMonth, {
            key: 'm' + monthIndex,
            year: props.year,
            monthIndex: monthIndex,
            lang: props.lang,
            recordMap: props.recordMap,
            today: props.today,
            onOpen: props.onOpenDay,
          }),
        );
      }
      return h(
        'div',
        { className: 'es-yearGrid', 'data-early-sleep-year': '', 'aria-label': props.t('year.monthsAria') },
        months,
      );
    }

    // ── Day editor ───────────────────────────────────────────────────────────
    function DayEditor(props) {
      const t = props.t;
      const lang = props.lang;
      const existing = props.record || null;
      const [time, setTime] = React.useState(existing ? existing.time : DEFAULT_TIME);
      const [note, setNote] = React.useState(existing ? existing.note : '');

      const save = function () {
        props.onSave(props.date, time || DEFAULT_TIME, note);
      };
      const remove = function () {
        if (
          typeof window.confirm === 'function' &&
          !window.confirm(t('editor.deleteConfirm', { date: props.date }))
        ) {
          return;
        }
        props.onRemove(props.date);
      };

      return h(
        'section',
        { className: 'es-card es-editor', 'data-early-sleep-editor': '' },
        h(
          'div',
          { className: 'es-editorHead' },
          h(
            'h2',
            { className: 'es-editorTitle' },
            existing ? t('editor.title.edit') : t('editor.title.new'),
            ' · ',
            h('span', { className: 'es-editorDate' }, formatDateLong(props.date, lang)),
          ),
          existing && existing.createdAt > 0
            ? h(
                'span',
                { className: 'es-editorMeta' },
                t('editor.savedAt', { time: formatTime(existing.createdAt, lang) }),
              )
            : null,
        ),
        h(
          'div',
          { className: 'es-fieldRow' },
          h(
            'label',
            { className: 'es-field' },
            h('span', { className: 'es-fieldLabel' }, t('editor.time')),
            h('input', {
              className: 'es-input',
              type: 'time',
              value: time,
              'data-early-sleep-time': '',
              onChange: function (event) {
                setTime(event.target.value);
              },
            }),
            h(
              'p',
              { className: isLateTime(time || DEFAULT_TIME) ? 'es-lateHint' : 'es-fieldLabel' },
              isLateTime(time || DEFAULT_TIME) ? t('editor.lateHint') : t('editor.successHint'),
            ),
          ),
          h(
            'label',
            { className: 'es-field es-fieldGrow' },
            h('span', { className: 'es-fieldLabel' }, t('editor.note')),
            h('input', {
              className: 'es-input',
              type: 'text',
              value: note,
              maxLength: 200,
              placeholder: t('editor.notePlaceholder'),
              'data-early-sleep-note': '',
              onChange: function (event) {
                setNote(event.target.value);
              },
            }),
          ),
        ),
        h(
          'div',
          { className: 'es-editorActions' },
          h(
            'button',
            {
              type: 'button',
              className: 'es-btn es-btnPrimary',
              'data-early-sleep-save': '',
              disabled: props.mutating,
              onClick: save,
            },
            h(MoonGlyph, { size: 12 }),
            h(
              'span',
              null,
              props.mutating ? t('editor.saving') : existing ? t('editor.update') : t('editor.save'),
            ),
          ),
          existing
            ? h(
                'button',
                {
                  type: 'button',
                  className: 'es-btn es-btnDanger',
                  'data-early-sleep-delete': '',
                  disabled: props.mutating,
                  onClick: remove,
                },
                t('editor.delete'),
              )
            : null,
          h('span', { className: 'es-editorSpacer' }),
          h(
            'button',
            {
              type: 'button',
              className: 'es-btn',
              disabled: props.mutating,
              onClick: props.onClose,
            },
            t('editor.close'),
          ),
        ),
        props.error ? h('p', { className: 'es-errorText', role: 'alert' }, props.error) : null,
      );
    }

    // ── Panel ────────────────────────────────────────────────────────────────
    function CalendarPanel(props) {
      const t = props.t;
      const locale = props.locale;
      const lang = useActiveLocale(locale);
      const today = todayKey();
      const initial = parseKey(today);
      const [view, setView] = React.useState('month');
      const [cursor, setCursor] = React.useState({ year: initial.year, monthIndex: initial.monthIndex });
      const [selectedDate, setSelectedDate] = React.useState(null);
      const records = useRecords();

      const recordMap = React.useMemo(
        function () {
          const map = new Map();
          if (Array.isArray(records.records)) {
            for (const record of records.records) {
              if (record && typeof record.date === 'string') map.set(record.date, record);
            }
          }
          return map;
        },
        [records.records],
      );

      const stats = React.useMemo(
        function () {
          const successSet = new Set();
          let failed = 0;
          for (const record of recordMap.values()) {
            if (isLateRecord(record)) failed += 1;
            else successSet.add(record.date);
          }
          const streaks = computeStreaks(successSet, today);
          const prefix = cursor.year + '-' + pad2(cursor.monthIndex + 1) + '-';
          let monthCount = 0;
          for (const key of successSet) {
            if (key.slice(0, 8) === prefix) monthCount += 1;
          }
          return {
            total: successSet.size,
            failed: failed,
            current: streaks.current,
            longest: streaks.longest,
            monthCount: monthCount,
          };
        },
        [recordMap, cursor, today],
      );

      const shift = function (delta) {
        setCursor(function (previous) {
          if (view === 'year') return { year: previous.year + delta, monthIndex: previous.monthIndex };
          const next = new Date(previous.year, previous.monthIndex + delta, 1);
          return { year: next.getFullYear(), monthIndex: next.getMonth() };
        });
      };

      const goToday = function () {
        const now = parseKey(todayKey());
        setCursor({ year: now.year, monthIndex: now.monthIndex });
      };

      const selectDate = function (key) {
        setSelectedDate(key);
        const parts = parseKey(key);
        setCursor({ year: parts.year, monthIndex: parts.monthIndex });
      };

      const openDayFromYear = function (key) {
        const parts = parseKey(key);
        setCursor({ year: parts.year, monthIndex: parts.monthIndex });
        setSelectedDate(key);
        setView('month');
      };

      const quickCheckin = function () {
        records.save(today, DEFAULT_TIME, '').then(function (ok) {
          if (ok) setSelectedDate(today);
        });
      };

      const head = h(
        'header',
        { className: 'es-headRow' },
        h(
          'div',
          { className: 'es-heading' },
          h('h1', { className: 'es-title' }, t('panel.title')),
          h('p', { className: 'es-sub' }, t('panel.subtitle')),
        ),
        h(
          'div',
          { className: 'es-headRight' },
          h(
            'div',
            { className: 'es-tabs', role: 'group', 'aria-label': t('view.aria') },
            ['month', 'year'].map(function (id) {
              return h(
                'button',
                {
                  key: id,
                  type: 'button',
                  className: 'es-tab',
                  'aria-pressed': id === view,
                  'data-early-sleep-view': id,
                  onClick: function () {
                    setView(id);
                  },
                },
                t('view.' + id),
              );
            }),
          ),
          recordMap.has(today)
            ? h(
                'span',
                { className: 'es-btn', 'data-early-sleep-checked': '', role: 'status' },
                h(MoonGlyph, { size: 12 }),
                h('span', null, t('quick.checked')),
              )
            : h(
                'button',
                {
                  type: 'button',
                  className: 'es-btn es-btnPrimary',
                  'data-early-sleep-quick': '',
                  disabled: records.mutating,
                  onClick: quickCheckin,
                },
                h(MoonGlyph, { size: 12 }),
                h('span', null, t('quick.checkin')),
              ),
        ),
      );

      let body;
      if (records.state === 'error' && !records.records) {
        body = h(
          'section',
          { className: 'es-card es-errorCard' },
          h(
            'div',
            { className: 'es-errorHead' },
            h('span', { className: 'es-errorDot', 'aria-hidden': 'true' }),
            h('h2', { className: 'es-errorTitle' }, t('panel.errorTitle')),
          ),
          h('p', { className: 'es-errorText' }, records.error || ''),
          h(
            'button',
            { type: 'button', className: 'es-btn es-btnPrimary', onClick: records.reload },
            t('panel.retry'),
          ),
        );
      } else if (records.state === 'loading' && !records.records) {
        body = h(
          'section',
          { className: 'es-card es-loadingCard', 'aria-busy': 'true' },
          h(
            'div',
            { className: 'es-loadingRow' },
            h('span', { className: 'es-loadingDot', 'aria-hidden': 'true' }),
            h('span', null, t('panel.loading')),
          ),
          h('div', { className: 'es-skeleton', style: { width: '52%' } }),
          h('div', { className: 'es-skeleton', style: { width: '78%' } }),
          h('div', { className: 'es-skeleton', style: { width: '34%' } }),
        );
      } else {
        const calendarTitle =
          view === 'year' ? String(cursor.year) : monthLabel(cursor.year, cursor.monthIndex, lang);
        const sections = [];
        sections.push(h(StatsBar, { key: 'stats', t: t, stats: stats }));
        sections.push(
          h(
            'section',
            { key: 'cal', className: 'es-card' },
            h(
              'div',
              { className: 'es-calHead' },
              h('h2', { className: 'es-calTitle', 'data-early-sleep-cursor': '' }, calendarTitle),
              h(
                'div',
                { className: 'es-calNav' },
                h(
                  'button',
                  {
                    type: 'button',
                    className: 'es-navBtn',
                    'aria-label': view === 'year' ? t('nav.prevYear') : t('nav.prevMonth'),
                    title: view === 'year' ? t('nav.prevYear') : t('nav.prevMonth'),
                    'data-early-sleep-prev': '',
                    onClick: function () {
                      shift(-1);
                    },
                  },
                  '‹',
                ),
                h('button', { type: 'button', className: 'es-btn', onClick: goToday }, t('nav.today')),
                h(
                  'button',
                  {
                    type: 'button',
                    className: 'es-navBtn',
                    'aria-label': view === 'year' ? t('nav.nextYear') : t('nav.nextMonth'),
                    title: view === 'year' ? t('nav.nextYear') : t('nav.nextMonth'),
                    'data-early-sleep-next': '',
                    onClick: function () {
                      shift(1);
                    },
                  },
                  '›',
                ),
              ),
            ),
            view === 'year'
              ? h(YearView, {
                  t: t,
                  lang: lang,
                  year: cursor.year,
                  recordMap: recordMap,
                  today: today,
                  onOpenDay: openDayFromYear,
                })
              : h(MonthView, {
                  t: t,
                  year: cursor.year,
                  monthIndex: cursor.monthIndex,
                  recordMap: recordMap,
                  today: today,
                  selectedDate: selectedDate,
                  onSelect: selectDate,
                }),
          ),
        );
        if (selectedDate !== null) {
          sections.push(
            h(DayEditor, {
              key: 'editor-' + selectedDate,
              t: t,
              lang: lang,
              date: selectedDate,
              record: recordMap.get(selectedDate) || null,
              mutating: records.mutating,
              error: records.mutationError,
              onSave: records.save,
              onRemove: records.remove,
              onClose: function () {
                setSelectedDate(null);
              },
            }),
          );
        }
        sections.push(
          h(
            'footer',
            { key: 'foot', className: 'es-foot' },
            t('footer.count', { n: stats.total + stats.failed, failed: stats.failed }),
          ),
        );
        body = sections;
      }

      return h(
        'div',
        {
          className: 'es-root',
          'data-early-sleep-panel': '',
          style: {
            boxSizing: 'border-box',
            height: '100%',
            overflowY: 'auto',
            background: 'var(--dsw-alias-bg-base)',
            color: 'var(--dsw-alias-label-primary)',
          },
        },
        h(Styles),
        h('div', { className: 'es-content' }, head, body),
      );
    }

    // ── Locale hook ──────────────────────────────────────────────────────────
    function useActiveLocale(locale) {
      return React.useSyncExternalStore(
        function (notify) {
          try {
            return locale.subscribe(notify);
          } catch (error) {
            return function () {};
          }
        },
        function () {
          try {
            const snapshot = locale.getSnapshot();
            const id =
              snapshot && typeof snapshot.id === 'string'
                ? snapshot.id
                : snapshot && typeof snapshot.locale === 'string'
                  ? snapshot.locale
                  : '';
            return id.toLowerCase().indexOf('zh') === 0 ? 'zh' : 'en';
          } catch (error) {
            return 'en';
          }
        },
      );
    }

    // ── Plugin entry ─────────────────────────────────────────────────────────
    function apply(ctx) {
      ctx.effect(
        function () {
          return ctx.locale.register(NS, { zh: DICT_ZH, en: DICT_EN });
        },
        'early-sleep: dictionaries',
      );

      const t = ctx.locale.bind(NS);
      const locale = ctx.locale;

      function PanelEntry() {
        return h(CalendarPanel, { t: t, locale: locale });
      }

      ctx.slots.inject('sidebar.panellist', function () {
        return ctx.slots.register(
          {
            name: 'sidebar.panellist',
            id: PANEL_ID,
            order: SIDEBAR_ORDER,
            label: function () {
              return t('nav.label');
            },
            locale: NS,
          },
          SidebarIcon,
        );
      });

      ctx.slots.inject('main', function () {
        return ctx.slots.register(
          {
            name: 'main',
            key: PANEL_ID,
            locale: NS,
          },
          PanelEntry,
        );
      });
    }

    return {
      inject: ['slots', 'locale', 'layout'],
      apply: apply,
    };
  },
});
