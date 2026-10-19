import React from 'react';
import { Clock, Users, Lightbulb, Thermometer, Sun, Wifi, ChevronRight } from 'lucide-react';

export default function RecentActivity({ activityLog = [], onViewAll }) {
  const getEventIcon = (type) => {
    switch (type) {
      case 'MOTION_DETECTED':
      case 'MOTION_CLEARED':
        return <Users className="w-3.5 h-3.5 text-emerald-600" />;
      case 'LED_STATE':
      case 'CMD_LED':
        return <Lightbulb className="w-3.5 h-3.5 text-amber-500" />;
      case 'FAN_SPEED':
      case 'FAN_AUTO':
      case 'FAN_MANUAL':
        return <Thermometer className="w-3.5 h-3.5 text-orange-500" />;
      case 'LIGHT_LEVEL':
        return <Sun className="w-3.5 h-3.5 text-amber-500" />;
      case 'CONNECT':
      case 'DISCONNECT':
        return <Wifi className="w-3.5 h-3.5 text-sky-500" />;
      default:
        return <Clock className="w-3.5 h-3.5 text-stone-400" />;
    }
  };

  const getEventBg = (type) => {
    switch (type) {
      case 'MOTION_DETECTED':
        return 'bg-emerald-50 text-emerald-600';
      case 'LED_STATE':
        return 'bg-amber-50 text-amber-600';
      case 'FAN_SPEED':
        return 'bg-orange-50 text-orange-600';
      case 'LIGHT_LEVEL':
        return 'bg-amber-50 text-amber-600';
      case 'CONNECT':
        return 'bg-sky-50 text-sky-600';
      default:
        return 'bg-stone-50 text-stone-500';
    }
  };

  return (
    <div className="bg-white/70 backdrop-blur-xl border border-stone-200/70 rounded-3xl p-5 shadow-sm flex flex-col justify-between">
      <div>
        {/* Header matching reference */}
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-2">
            <Clock className="w-4 h-4 text-stone-600" />
            <h3 className="text-sm font-bold text-stone-900 tracking-tight">Recent Activity</h3>
          </div>

          <button
            type="button"
            onClick={onViewAll}
            className="text-[11px] font-semibold text-[#4338ca] hover:underline flex items-center gap-0.5"
          >
            <span>View All</span>
            <ChevronRight className="w-3 h-3" />
          </button>
        </div>

        {/* List of observed events */}
        {activityLog.length === 0 ? (
          <div className="py-8 text-center text-stone-400 text-xs">
            <Clock className="w-6 h-6 mx-auto mb-1.5 opacity-40" />
            <div>Awaiting real hardware events...</div>
          </div>
        ) : (
          <div className="space-y-2.5 my-1">
            {activityLog.slice(0, 5).map((item) => (
              <div key={item.id} className="flex items-center justify-between gap-3 py-1">
                <div className="flex items-center gap-2.5 min-w-0">
                  <div
                    className={`w-7 h-7 rounded-full flex items-center justify-center flex-shrink-0 ${getEventBg(
                      item.type
                    )}`}
                  >
                    {getEventIcon(item.type)}
                  </div>
                  <div className="min-w-0">
                    <div className="text-xs font-semibold text-stone-800 truncate">
                      {item.message.split('(')[0].trim()}
                    </div>
                    {item.message.includes('(') && (
                      <div className="text-[10px] text-stone-400 truncate">
                        {item.message.substring(item.message.indexOf('(') + 1).replace(')', '')}
                      </div>
                    )}
                  </div>
                </div>

                <div className="text-[10px] font-mono text-stone-400 whitespace-nowrap flex-shrink-0">
                  {new Date(item.time).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      <div className="text-[10px] text-stone-400 border-t border-stone-100 pt-2 mt-2 flex justify-between">
        <span>Recorded during session</span>
        <span>{activityLog.length} events logged</span>
      </div>
    </div>
  );
}
