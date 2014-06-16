/*global Profile: false*/

//
//  Utility helpers.
//

Profile.getStoredAverageTime = function profileGetStoredAverageTimeFn(name)
{
    if (!this.prevProfiles)
    {
        return 0.0;
    }

    var data = this.prevProfiles[name];
    if (data === undefined)
    {
        return 0.0;
    }

    if (data.calls === 0)
    {
        return 0.0;
    }

    return data.duration / data.calls;
};

Profile.getStoredCallCount = function profileGetStoredCallCountFn(name)
{
    if (!this.prevProfiles)
    {
        return 0.0;
    }

    var data = this.prevProfiles[name];
    if (data === undefined)
    {
        return 0.0;
    }

    return data.calls;
};

Profile.getStoredDuration = function profileGetStoredDurationFn(name)
{
    if (!this.prevProfiles)
    {
        return 0.0;
    }

    var data = this.prevProfiles[name];
    if (data === undefined)
    {
        return 0.0;
    }

    return data.duration;
};

Profile.resetAndStore = function profileResetAndStoreFn()
{
    var profiles = this.profiles;

    var prevProfiles = this.prevProfiles;
    if (!prevProfiles)
    {
        this.prevProfiles = prevProfiles = {};
    }

    var name, profile, prevProfile;
    for (name in profiles)
    {
        if (profiles.hasOwnProperty(name))
        {
            profile = profiles[name];

            prevProfile = prevProfiles[name];
            if (!prevProfile)
            {
                prevProfiles[name] = prevProfile = {
                    name: name,
                    calls: 0,
                    duration: 0.0,
                    min: Number.MAX_VALUE,
                    max: 0.0,
                    sumOfSquares: 0.0
                };
            }

            prevProfile.calls = profile.calls;
            prevProfile.duration = profile.duration;
            prevProfile.min = profile.min;
            prevProfile.max = profile.max;
            prevProfile.sumOfSquares = profile.sumOfSquares;

            profile.calls = 0;
            profile.duration = 0.0;
            profile.min = Number.MAX_VALUE;
            profile.max = 0.0;
            profile.sumOfSquares = 0.0;
        }
    }
};
