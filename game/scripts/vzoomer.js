//
// Zoomer - class description
//

function Zoomer() {}

Zoomer.prototype =
{
    init : function (globals)
    {
        this.globals = globals;

        this.x    = 0;    // current value
        this.d    = 0;    // destination value
        this.endV = 0;

        this.v = 0;    // current speed
        this.a = 0;    // acceleration

        this.elapsedTime = 0;
        this.arriveTime = 0;

        this.s = 0;    // start value
        this.u = 0;    // initial speed
        this.i = 0;    // initial acceleration
        this.r = 0;    // d3x/dx3
        this.k = 0;    // d4x/dx4

        this.scratchpad = {};
    },

    setPosition : function (x)
    {
        this.s = this.x = this.d = x;
        this.endV = this.u = this.v = this.i = this.a = this.r = this.k = this.elapsedTime = this.arriveTime = 0;
    },

    setDestination : function (dest, time)
    {
        this.setDestinationWithSpeedAndTime(dest, 0, time);
    },

    setDestinationWithSpeedAndTime : function vzoomersetDestinationWithSpeedAndTimeFn(dest, speed, time)
    {
        if (time < 0.001)
        {
            this.setPosition(dest);
            return;
        }

        var md = this.globals.mathDevice;

        this.s           = this.x;
        this.u           = this.v;
        this.d           = dest;
        this.endV        = speed;
        this.arriveTime  = time;
        this.elapsedTime = 0;

        var scratchpad = this.scratchpad;

        var t_squared_over_2    = (this.arriveTime * this.arriveTime) / 2;
        var t_cubed_over_6      = (this.arriveTime * t_squared_over_2) / 3;
        var t_to_4_over_24      = (t_squared_over_2 * t_squared_over_2) / 6;

        // Use matrix to solve simultaneous equations with 3 unknowns

        // mat.e11 = t_to_4_over_24;
        // mat.e12 = t_cubed_over_6;
        // mat.e13 = t_squared_over_2;
        // mat.e21 = t_cubed_over_6;
        // mat.e22 = t_squared_over_2;
        // mat.e23 = arriveTime;
        // mat.e31 = t_squared_over_2;
        // mat.e32 = arriveTime;
        // mat.e33 = 1;
        // mat.e41 = mat.e42 = mat.e43 = 0;
        var mat = scratchpad.mat = md.m43Build(
            t_to_4_over_24,
            t_cubed_over_6,
            t_squared_over_2,
            t_cubed_over_6,
            t_squared_over_2,
            this.arriveTime,
            t_squared_over_2,
            this.arriveTime,
            1,
            0,
            0,
            0,
            scratchpad.mat);

        //inverse.SetInverse(mat);
        var inverse = scratchpad.inverse = md.m43Inverse(mat, scratchpad.inverse);

        // vector.x = d - s - u * arriveTime;
        // vector.y = endV - u;
        // vector.z = 0;
        var vector = scratchpad.vector = md.v3Build(
            this.d - this.s - this.u * this.arriveTime,
            this.endV - this.u,
            0,
            scratchpad.vector);

        //inverse.TransformPoint(vector);
        vector = md.m43TransformPoint(inverse, vector);

        this.k = vector[0];
        this.r = vector[1];
        this.i = vector[2];
    },

    getCurrentValue : function vzoomergetCurrentValueFn()
    {
        return this.x;
    },

    getDestination : function gzoomerGetDestinationFn()
    {
        return this.d;
    },

    update : function vzoomerUpdateFn(f_t_inc)
    {
        this.elapsedTime += f_t_inc;

        if (this.elapsedTime >= this.arriveTime) // terminating condition
        {
            this.x = this.d;
            this.v = this.endV;
            this.a = 0;
            this.elapsedTime = this.arriveTime;
            return;
        }

        var t_squared_over_2    = (this.elapsedTime * this.elapsedTime) / 2;
        var t_cubed_over_6      = (this.elapsedTime * t_squared_over_2) / 3;
        var t_to_4_over_24      = (t_squared_over_2 * t_squared_over_2) / 6;

        this.v = this.k * t_cubed_over_6      + this.r * t_squared_over_2  + this.i * this.elapsedTime       + this.u;
        this.x = this.k * t_to_4_over_24      + this.r * t_cubed_over_6    + this.i * t_squared_over_2  + this.u * this.elapsedTime + this.s;
    },

    offset : function vzoomerOffsetFn(amount)
    {
        this.x += amount;
        this.d += amount;
        this.s += amount;
    },

    arrived : function vzoomerArrivedFn()
    {
        return (this.elapsedTime === this.arriveTime);
    }
};

Zoomer.create = function zoomerCreateFn(globals)
{
    var zoomer = new Zoomer();

    zoomer.init(globals);

    return zoomer;
};

//
// V3Zoomer - class description
//

function V3Zoomer() {}

V3Zoomer.prototype =
{
    init : function vzoomerInitFn(globals)
    {
        this.globals = globals;

        this.x = Zoomer.create(globals);
        this.Y = Zoomer.create(globals);
        this.Z = Zoomer.create(globals);
    },

    setv3Position : function vzoomerSetv3PositionFn(v3Position)
    {
        this.x.setPosition(v3Position[0]);
        this.Y.setPosition(v3Position[1]);
        this.Z.setPosition(v3Position[2]);
    },

    setDestinationWithVelocityAndTime : function vzoomerSetDestinationWithVelocityAndTimeFn(v3Destination, v3Velocity, time)
    {
        this.x.setDestinationWithSpeedAndTime(v3Destination[0], v3Velocity[0], time);
        this.Y.setDestinationWithSpeedAndTime(v3Destination[1], v3Velocity[1], time);
        this.Z.setDestinationWithSpeedAndTime(v3Destination[2], v3Velocity[2], time);
    },

    //     void        SetDestinationGivenTimeSpeedAndFollowingPoint(const LHPoint &dest, float time, float speed, const LHPoint &following)
    // {
    //     LHPoint
    //         dir_to(following-dest),
    //         dir_fr(getCurrentValue()-dest);

    //     dir_to.Normalize();
    //     dir_fr.Normalize();
    //     LHPoint temp(dir_to + dir_fr);
    //     LHPoint perp(dir_to ^ temp);
    //     LHPoint vel(temp ^ perp);
    //     vel.SetSize(speed);

    //     x.setDestinationWithSpeedAndTime(dest.x, vel.x, time);
    //     Y.setDestinationWithSpeedAndTime(dest.y, vel.y, time);
    //     Z.setDestinationWithSpeedAndTime(dest.z, vel.z, time);
    // }

    setv3Destination : function vzoomerSetv3DestinationFn(v3Destination, time)
    {
        this.x.setDestination(v3Destination[0], time);
        this.Y.setDestination(v3Destination[1], time);
        this.Z.setDestination(v3Destination[2], time);
    },

    getv3Velocity : function vzoomerGetv3VelocityFn()
    {
        var md = this.globals.mathDevice;
        this.v3Velocity = md.v3Build(this.x.v, this.Y.v, this.Z.v, this.v3Velocity);
        return this.v3Velocity;
    },

    getv3Location : function vzoomerGetv3LocationFn()
    {
        var md = this.globals.mathDevice;
        this.v3Location = md.v3Build(this.x.getCurrentValue(), this.Y.getCurrentValue(), this.Z.getCurrentValue(), this.v3Location);
        return this.v3Location;
    },

    getv3Destination : function vzoomerGetv3DestinationFn()
    {
        var md = this.globals.mathDevice;
        this.v3Destination = md.v3Build(this.x.getDestination(), this.Y.getDestination(), this.Z.getDestination(), this.v3Destination);
        return this.v3Destination;
    },

    //float       GetCurrentSpeed() const             { return (float) sqrt ((x.v * x.v) + (Y.v * Y.v) + (Z.v * Z.v)); }

    update : function vzoomerUpdateFn(f_t_inc)
    {
        this.x.update(f_t_inc);
        this.Y.update(f_t_inc);
        this.Z.update(f_t_inc);
    },

    offset : function vzoomerOffsetFn(v3Offset)
    {
        this.x.Offset(v3Offset[0]);
        this.Y.Offset(v3Offset[1]);
        this.Z.Offset(v3Offset[2]);
    },

    arrived : function vzoomerArrivedFn()
    {
        return this.x.arrived();
    }
};

V3Zoomer.create = function V3ZoomerCreateFn(globals)
{
    var v3Zoomer = new V3Zoomer();

    v3Zoomer.init(globals);

    return v3Zoomer;
};
