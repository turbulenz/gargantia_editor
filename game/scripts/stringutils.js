//
//  StringUtils
//  ===========
//
//  Helper class for performing string operations.
//

function StringUtils() {}

StringUtils.prototype =
{
    fitTextToRegion : function StringUtilsFitTextToRegionFn(fontRenderer, string, inputParams)
    {
        var modifiedString = string;
        //var regionX       = (inputParams.x !== undefined) ? inputParams.x : 0;
        //var regionY       = (inputParams.y !== undefined) ? inputParams.y : 0;
        var regionWidth   = (inputParams.width !== undefined) ? inputParams.width : 400;
        //var regionHeight  = (inputParams.height !== undefined) ? inputParams.height : 200;
        var spacing = (inputParams.spacing !== undefined) ? inputParams.spacing : 0;

        var textDimensions;
        var newlines = [];

        var params = {};
        fontRenderer.calculateFontAndScaleFromInputParams(inputParams, params);

        var scale   =   params.scale;
        var font    =   params.font;

        textDimensions = font.calculateTextDimensions(modifiedString, scale, spacing);

        //check the longest width
        if (textDimensions.width <= regionWidth)
        {
            return modifiedString;
        }

        do
        {
            var lineString;
            var lineWidth;
            var endIndex;
            var breakUsingSpace = true;

            lineString = modifiedString;

            do
            {
                textDimensions = font.calculateTextDimensions(lineString, scale, spacing);
                endIndex = lineString.length;

                if (textDimensions.width > regionWidth)
                {
                    if (breakUsingSpace)
                    {
                        endIndex = lineString.lastIndexOf(" ");
                    }
                    else
                    {
                        endIndex = lineString.length - 1;
                    }

                    if (endIndex <= 0)
                    {
                        endIndex = lineString.length;
                        breakUsingSpace = false;
                    }
                }

                lineString = lineString.substr(0, endIndex);
                textDimensions = font.calculateTextDimensions(lineString, scale, spacing);
                lineWidth = textDimensions.width;
            }while (lineWidth > regionWidth);

            newlines.push(lineString);
            modifiedString = modifiedString.substr(endIndex, modifiedString.length);

        }while (modifiedString.length > 0);

        for (var index = 0; index < newlines.length; index += 1)
        {
            modifiedString = modifiedString + newlines[index] + "\n";
        }

        modifiedString = modifiedString.slice(0, -1);

        return modifiedString;
    },

    format : function StringUtilsFormatFn(string)
    {
        //based on information from http://javascriptweblog.wordpress.com/2011/01/18/javascripts-arguments-object-and-beyond/
        var args = arguments;
        var pattern = new RegExp("%([1-" + (arguments.length - 1) + "])", "gi");

        return string.replace(pattern, function (match, index) {return args[index]; });
    }
};
