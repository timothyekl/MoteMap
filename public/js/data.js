function adc_to_kelvin(adc) {
    var a = 0.001010024;
    var b = 0.000242127;
    var c = 0.000000146;
    var R1 = 10000;
    var ADC_FS = 1023;
    var Rthr = R1 * (ADC_FS - adc) / adc;
    return 1 / (a + b * Math.log(Rthr) + c * Math.pow(Math.log(Rthr), 3));
}

function adc_to_celsius(adc) {
    return adc_to_kelvin(adc) - 273.15;
}
