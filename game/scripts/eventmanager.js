//
//  EventManager
//
/*global Observer: false */

function EventManager() {}

EventManager.prototype =
{
    subscribe : function eventManagerSubscribe(eventName, callback)
    {
        var observer = this.events[eventName];
        if (!observer)
        {
            observer = this.events[eventName] = Observer.create();
        }
        observer.subscribe(callback);
    },

    unsubscribe : function eventManagerUnsubscribe(eventName, callback)
    {
        this.events[eventName].unsubscribe(callback);
    },

    notify : function eventManagerNotify(eventName /*other args are passed through*/)
    {
        var observer = this.events[eventName];
        if (observer)
        {
            observer.notify.apply(observer, Array.prototype.slice.call(arguments, 1));
        }
    },

    reset : function eventManagerResetFn()
    {
        var events = this.events;

        var propertyName;

        for (propertyName in events)
        {
            if (events.hasOwnProperty(propertyName))
            {
                events[propertyName].unsubscribeAll();
            }
        }

        this.events =   {};
    }
};

EventManager.create = function eventManagerCreateFn()
{
    var eventManager = new EventManager();
    eventManager.events = {};
    return eventManager;
};
