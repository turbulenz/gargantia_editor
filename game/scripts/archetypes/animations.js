
var AnimationSet = { archetypes : {} };

AnimationSet.archetypes.ledo_kite =
{
    initialAnimation: 'neutral_md',
    rootNode: 'default_TSMGWorldJoint',
    animations: {
        forward_md: {
            path : 'animations/a_ledokite_forwars_md.dae',
            looping : true,
            randomStartTime : false,
            speedRange : [1.0, 1.0]
        },
        neutral_md: {
            path : 'animations/a_ledokite_neutral_md.dae',
            looping : true,
            randomStartTime : false,
            speedRange : [1.0, 1.0]
        },
        neutral_lf: {
            path : 'animations/a_ledokite_neutral_lf.dae',
            looping : true,
            randomStartTime : false,
            speedRange : [1.0, 1.0]
        },
        neutral_rt: {
            path : 'animations/a_ledokite_neutral_rt.dae',
            looping : true,
            randomStartTime : false,
            speedRange : [1.0, 1.0]
        }
    },
    nodeTree: {
        headNode: {
            name: 'neutral_forward_blend',
            type: 'blend',
            controlName: 'neutral_forward',
            blendDuration: 0.15,
            inputs: [{
                blendValue: 0,
                name: 'neutral',
                type: 'blend',
                controlName: 'direction',
                blendDuration: 0.15,
                inputs: [{
                    blendValue: -1,
                    name: 'left',
                    type: 'animation',
                    animationName: 'neutral_lf'
                }, {
                    blendValue: 0,
                    name: 'normal',
                    type: 'animation',
                    animationName: 'neutral_md'
                }, {
                    blendValue: 1,
                    name: 'right',
                    type: 'animation',
                    animationName: 'neutral_rt'
                }]
            }, {
                blendValue: 1,
                name: 'foward',
                type: 'animation',
                animationName: 'forward_md'
            }]
        }
    }
};
