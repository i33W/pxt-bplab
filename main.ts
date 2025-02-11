/**
* BP Lab Extensions
*/
//% weight=1 color=#0066CB icon="\uf0ad" block="BP Lab"
namespace BPLAB {

    // 그룹 1: LCD 관련
    // -----------------------------------------------------------------------------
    let i2cAddr: number // 0x3F: PCF8574A, 0x27: PCF8574 
    let BK: number      // Backlight control
    let RS: number      // Command/Data selection

    // LCD register setup
    function setreg(d: number) {
        pins.i2cWriteNumber(i2cAddr, d, NumberFormat.Int8LE)
        basic.pause(1)
    }

    // Send data through I2C bus
    function set(d: number) {
        d = d & 0xF0
        d = d + BK + RS
        setreg(d)
        setreg(d + 4)
        setreg(d)
    }

    // Send command
    function cmd(d: number) {
        RS = 0
        set(d)
        set(d << 4)
    }

    // Send data
    function dat(d: number) {
        RS = 1
        set(d)
        set(d << 4)
    }

    // Auto detect LCD address
    function AutoAddr() {
        let k = true
        let addr = 0x20
        let d1 = 0, d2 = 0
        while (k && (addr < 0x28)) {
            pins.i2cWriteNumber(addr, -1, NumberFormat.Int32LE)
            d1 = pins.i2cReadNumber(addr, NumberFormat.Int8LE) % 16
            pins.i2cWriteNumber(addr, 0, NumberFormat.Int16LE)
            d2 = pins.i2cReadNumber(addr, NumberFormat.Int8LE)
            if ((d1 == 7) && (d2 == 0)) k = false
            else addr += 1
        }
        if (!k) return addr

        addr = 0x38
        while (k && (addr < 0x40)) {
            pins.i2cWriteNumber(addr, -1, NumberFormat.Int32LE)
            d1 = pins.i2cReadNumber(addr, NumberFormat.Int8LE) % 16
            pins.i2cWriteNumber(addr, 0, NumberFormat.Int16LE)
            d2 = pins.i2cReadNumber(addr, NumberFormat.Int8LE)
            if ((d1 == 7) && (d2 == 0)) k = false
            else addr += 1
        }
        if (!k) return addr
        else return 0
    }

    /**
     * Initialize LCD and set I2C address. PCF8574/PCF8574A address is 39/63
     * @param Addr LCD i2c address, eg: 0, 39, 63. 0 for auto detection
     */
    //% group="LCD"
    //% color=#0fbc11
    //% blockId="I2C_LCD1620_SET_ADDRESS" block="LCD initialize with Address %addr"
    //% weight=100 blockGap=8
    //% parts=LCD1602_I2C trackArgs=0
    export function LcdInit(Addr: number) {
        if (Addr == 0) i2cAddr = AutoAddr()
        else i2cAddr = Addr
        BK = 8
        RS = 0
        cmd(0x33)       // Set 4-bit mode
        basic.pause(5)
        set(0x30)
        basic.pause(5)
        set(0x20)
        basic.pause(5)
        cmd(0x28)       // Set mode
        cmd(0x0C)
        cmd(0x06)
        cmd(0x01)       // Clear screen
    }

    /**
     * Display number at specified position on LCD
     * @param n number to display, eg: 10, 100, 200
     * @param x LCD column position, eg: 0
     * @param y LCD row position, eg: 0
     */
    //% group="LCD"
    //% color=#0fbc11
    //% blockId="I2C_LCD1620_SHOW_NUMBER" block="show number %n|at x %x|y %y"
    //% weight=90 blockGap=8
    //% x.min=0 x.max=15
    //% y.min=0 y.max=1
    //% parts=LCD1602_I2C trackArgs=0
    export function ShowNumber(n: number, x: number, y: number): void {
        let s = n.toString()
        ShowString(s, x, y)
    }

    /**
     * Display string at specified position on LCD
     * @param s string to display, eg: "Hello"
     * @param x LCD column position, [0 - 15], eg: 0
     * @param y LCD row position, [0 - 1], eg: 0
     */
    //% group="LCD"
    //% color=#0fbc11
    //% blockId="I2C_LCD1620_SHOW_STRING" block="show string %s|at x %x|y %y"
    //% weight=90 blockGap=8
    //% x.min=0 x.max=15
    //% y.min=0 y.max=1
    //% parts=LCD1602_I2C trackArgs=0
    export function ShowString(s: string, x: number, y: number): void {
        let a: number

        if (y > 0)
            a = 0xC0
        else
            a = 0x80
        a += x
        cmd(a)

        for (let i = 0; i < s.length; i++) {
            dat(s.charCodeAt(i))
        }
    }

    /**
     * Turn on LCD
     */
    //% group="LCD"
    //% color=#0fbc11
    //% blockId="I2C_LCD1620_ON" block="turn on LCD"
    //% weight=81 blockGap=8
    //% parts=LCD1602_I2C trackArgs=0
    export function on(): void {
        cmd(0x0C)
    }

    /**
     * Turn off LCD
     */
    //% group="LCD"
    //% color=#0fbc11
    //% blockId="I2C_LCD1620_OFF" block="turn off LCD"
    //% weight=80 blockGap=8
    //% parts=LCD1602_I2C trackArgs=0
    export function off(): void {
        cmd(0x08)
    }

    /**
     * Clear all display contents
     */
    //% group="LCD"
    //% color=#0fbc11
    //% blockId="I2C_LCD1620_CLEAR" block="clear LCD"
    //% weight=85 blockGap=8
    //% parts=LCD1602_I2C trackArgs=0
    export function clear(): void {
        cmd(0x01)
    }

    /**
     * Turn on LCD backlight
     */
    //% group="LCD"
    //% color=#0fbc11
    //% blockId="I2C_LCD1620_BACKLIGHT_ON" block="turn on backlight"
    //% weight=71 blockGap=8
    //% parts=LCD1602_I2C trackArgs=0
    export function BacklightOn(): void {
        BK = 8
        cmd(0)
    }

    /**
     * Turn off LCD backlight
     */
    //% group="LCD"
    //% color=#0fbc11
    //% blockId="I2C_LCD1620_BACKLIGHT_OFF" block="turn off backlight"
    //% weight=70 blockGap=8
    //% parts=LCD1602_I2C trackArgs=0
    export function BacklightOff(): void {
        BK = 0
        cmd(0)
    }

    /**
     * Shift display left
     */
    //% group="LCD"
    //% color=#0fbc11
    //% blockId="I2C_LCD1620_SHL" block="Shift Left"
    //% weight=61 blockGap=8
    //% parts=LCD1602_I2C trackArgs=0
    export function shl(): void {
        cmd(0x18)
    }

    /**
     * Shift display right
     */
    //% group="LCD"
    //% color=#0fbc11
    //% blockId="I2C_LCD1620_SHR" block="Shift Right"
    //% weight=60 blockGap=8
    //% parts=LCD1602_I2C trackArgs=0
    export function shr(): void {
        cmd(0x1C)
    }

    // 그룹 2: 7-Segment 관련
    // -----------------------------------------------------------------------------
    let TM1637_CMD1 = 0x40;
    let TM1637_CMD2 = 0xC0;
    let TM1637_CMD3 = 0x80;
    let _SEGMENTS = [0x3F, 0x06, 0x5B, 0x4F, 0x66, 0x6D, 0x7D, 0x07, 0x7F, 0x6F, 0x77, 0x7C, 0x39, 0x5E, 0x79, 0x71];

    /**
     * TM1637 LED display
     */
    export class TM1637LEDs {
        buf: Buffer;
        clk: DigitalPin;
        dio: DigitalPin;
        _ON: number;
        brightness: number;
        count: number;  // number of LEDs

        /**
         * initial TM1637
         */
        init(): void {
            pins.digitalWritePin(this.clk, 0);
            pins.digitalWritePin(this.dio, 0);
            this._ON = 8;
            this.buf = pins.createBuffer(this.count);
            this.clear();
        }

        /**
         * Start 
         */
        _start() {
            pins.digitalWritePin(this.dio, 0);
            pins.digitalWritePin(this.clk, 0);
        }

        /**
         * Stop
         */
        _stop() {
            pins.digitalWritePin(this.dio, 0);
            pins.digitalWritePin(this.clk, 1);
            pins.digitalWritePin(this.dio, 1);
        }

        /**
         * send command1
         */
        _write_data_cmd() {
            this._start();
            this._write_byte(TM1637_CMD1);
            this._stop();
        }

        /**
         * send command3
         */
        _write_dsp_ctrl() {
            this._start();
            this._write_byte(TM1637_CMD3 | this._ON | this.brightness);
            this._stop();
        }

        /**
         * send a byte to 2-wire interface
         */
        _write_byte(b: number) {
            for (let i = 0; i < 8; i++) {
                pins.digitalWritePin(this.dio, (b >> i) & 1);
                pins.digitalWritePin(this.clk, 1);
                pins.digitalWritePin(this.clk, 0);
            }
            pins.digitalWritePin(this.clk, 1);
            pins.digitalWritePin(this.clk, 0);
        }

        /**
         * set TM1637 intensity, range is [0-8], 0 is off.
         * @param val the brightness of the TM1637, eg: 7
         */
        //% group="7-Segment"
        //% color=#50A820
        //% blockId="TM1637_set_intensity" block="%tm|set intensity %val"
        //% weight=50 blockGap=8
        //% parts="TM1637"
        intensity(val: number = 7) {
            if (val < 1) {
                this.off();
                return;
            }
            if (val > 8) val = 8;
            this._ON = 8;
            this.brightness = val - 1;
            this._write_data_cmd();
            this._write_dsp_ctrl();
        }

        /**
         * set data to TM1637, with given bit
         */
        _dat(bit: number, dat: number) {
            this._write_data_cmd();
            this._start();
            this._write_byte(TM1637_CMD2 | (bit % this.count))
            this._write_byte(dat);
            this._stop();
            this._write_dsp_ctrl();
        }

        /**
         * show a number in given position. 
         * @param num number will show, eg: 5
         * @param bit the position of the LED, eg: 0
         */
        //% group="7-Segment"
        //% color=#50A820
        //% blockId="TM1637_showbit" block="%tm|show digit %num |at %bit"
        //% weight=90 blockGap=8
        //% parts="TM1637"
        showbit(num: number = 5, bit: number = 0) {
            this.buf[bit % this.count] = _SEGMENTS[num % 16]
            this._dat(bit, _SEGMENTS[num % 16])
        }

        /**
          * show a number. 
          * @param num is a number, eg: 0
          */
        //% group="7-Segment"
        //% color=#50A820
        //% blockId="TM1637_shownum" block="%tm|show number %num"
        //% weight=91 blockGap=8
        //% parts="TM1637"
        showNumber(num: number) {
            if (num < 0) {
                this._dat(0, 0x40) // '-'
                num = -num
            }
            else
                this.showbit(Math.idiv(num, 1000) % 10)
            this.showbit(num % 10, 3)
            this.showbit(Math.idiv(num, 10) % 10, 2)
            this.showbit(Math.idiv(num, 100) % 10, 1)
        }

        /**
          * show a hex number. 
          * @param num is a hex number, eg: 0
          */
        //% group="7-Segment"
        //% color=#50A820
        //% blockId="TM1637_showhex" block="%tm|show hex number %num"
        //% weight=90 blockGap=8
        //% parts="TM1637"
        showHex(num: number) {
            if (num < 0) {
                this._dat(0, 0x40) // '-'
                num = -num
            }
            else
                this.showbit((num >> 12) % 16)
            this.showbit(num % 16, 3)
            this.showbit((num >> 4) % 16, 2)
            this.showbit((num >> 8) % 16, 1)
        }

        /**
         * show or hide dot point. 
         * @param bit is the position, eg: 1
         * @param show is show/hide dp, eg: true
         */
        //% group="7-Segment"
        //% color=#50A820
        //% blockId="TM1637_showDP" block="%tm|DotPoint at %bit|show %show"
        //% weight=70 blockGap=8
        //% parts="TM1637"
        showDP(bit: number = 1, show: boolean = true) {
            bit = bit % this.count
            if (show) this._dat(bit, this.buf[bit] | 0x80)
            else this._dat(bit, this.buf[bit] & 0x7F)
        }

        /**
         * clear LED. 
         */
        //% group="7-Segment"
        //% color=#50A820
        //% blockId="TM1637_clear" block="clear %tm"
        //% weight=80 blockGap=8
        //% parts="TM1637"
        clear() {
            for (let i = 0; i < this.count; i++) {
                this._dat(i, 0)
                this.buf[i] = 0
            }
        }

        /**
         * turn on LED. 
         */
        //% group="7-Segment"
        //% color=#50A820
        //% blockId="TM1637_on" block="turn on %tm"
        //% weight=86 blockGap=8
        //% parts="TM1637"
        on() {
            this._ON = 8;
            this._write_data_cmd();
            this._write_dsp_ctrl();
        }

        /**
         * turn off LED. 
         */
        //% group="7-Segment"
        //% color=#50A820
        //% blockId="TM1637_off" block="turn off %tm"
        //% weight=85 blockGap=8
        //% parts="TM1637"
        off() {
            this._ON = 0;
            this._write_data_cmd();
            this._write_dsp_ctrl();
        }
    }

    /**
     * create a TM1637 object.
     * @param clk the CLK pin for TM1637, eg: DigitalPin.P1
     * @param dio the DIO pin for TM1637, eg: DigitalPin.P2
     * @param intensity the brightness of the LED, eg: 7
     * @param count the count of the LED, eg: 4
     */
    //% group="7-Segment"
    //% color=#50A820
    //% weight=200 blockGap=8
    //% blockId="TM1637_create" block="CLK %clk|DIO %dio|intensity %intensity|LED count %count"
    export function create(clk: DigitalPin, dio: DigitalPin, intensity: number, count: number): TM1637LEDs {
        let tm = new TM1637LEDs();
        tm.clk = clk;
        tm.dio = dio;
        if ((count < 1) || (count > 5)) count = 4;
        tm.count = count;
        tm.brightness = intensity;
        tm.init();
        return tm;
    }

    // 그룹 3: Ultrasonic 관련
    // -----------------------------------------------------------------------------
    enum PingUnit {
        //% block="μs"
        MicroSeconds,
        //% block="cm"
        Centimeters,
        //% block="inches"
        Inches
    }

    /**
     * Send a ping and get the echo time (in microseconds) as a result
     * @param trig tigger pin
     * @param echo echo pin
     * @param unit desired conversion unit
     * @param maxCmDistance maximum distance in centimeters (default is 500)
     */
    //% group="Ultrasonic"
    //% color=#2c3e50
    //% blockId=sonar_ping block="ping trig %trig|echo %echo|unit %unit"
    export function ping(trig: DigitalPin, echo: DigitalPin, unit: PingUnit, maxCmDistance = 500): number {
        // send pulse
        pins.setPull(trig, PinPullMode.PullNone);
        pins.digitalWritePin(trig, 0);
        control.waitMicros(2);
        pins.digitalWritePin(trig, 1);
        control.waitMicros(10);
        pins.digitalWritePin(trig, 0);

        // read pulse
        const d = pins.pulseIn(echo, PulseValue.High, maxCmDistance * 58);

        switch (unit) {
            case PingUnit.Centimeters: return Math.idiv(d, 58);
            case PingUnit.Inches: return Math.idiv(d, 148);
            default: return d;
        }
    }

    // 그룹 4: DHT11 관련
    // -----------------------------------------------------------------------------
    export enum DHT11Type {
        //% block="temperature(℃)" enumval=0
        DHT11_temperature_C,

        //% block="temperature(℉)" enumval=1
        DHT11_temperature_F,

        //% block="humidity(0~100)" enumval=2
        DHT11_humidity,
    }

    let dht11Humidity = 0
    let dht11Temperature = 0

    /**
     * get dht11 temperature and humidity Value
     * @param dht11pin describe parameter here
     */
    //% group="DHT11"
    //% color=#ff7a4b
    //% blockId="readdht11" block="value of dht11 %dht11type| at pin %dht11pin"
    export function dht11value(dht11type: DHT11Type, dht11pin: DigitalPin): number {
        const DHT11_TIMEOUT = 100
        const buffer = pins.createBuffer(40)
        const data = [0, 0, 0, 0, 0]
        let startTime = control.micros()

        if (control.hardwareVersion().slice(0, 1) !== '1') { // V2
            // TODO: V2 bug
            pins.digitalReadPin(DigitalPin.P0);
            pins.digitalReadPin(DigitalPin.P1);
            pins.digitalReadPin(DigitalPin.P2);
            pins.digitalReadPin(DigitalPin.P3);
            pins.digitalReadPin(DigitalPin.P4);
            pins.digitalReadPin(DigitalPin.P10);

            // 1.start signal
            pins.digitalWritePin(dht11pin, 0)
            basic.pause(18)

            // 2.pull up and wait 40us
            pins.setPull(dht11pin, PinPullMode.PullUp)
            pins.digitalReadPin(dht11pin)
            control.waitMicros(40)

            // 3.read data
            startTime = control.micros()
            while (pins.digitalReadPin(dht11pin) === 0) {
                if (control.micros() - startTime > DHT11_TIMEOUT) break
            }
            startTime = control.micros()
            while (pins.digitalReadPin(dht11pin) === 1) {
                if (control.micros() - startTime > DHT11_TIMEOUT) break
            }

            for (let dataBits = 0; dataBits < 40; dataBits++) {
                startTime = control.micros()
                while (pins.digitalReadPin(dht11pin) === 1) {
                    if (control.micros() - startTime > DHT11_TIMEOUT) break
                }
                startTime = control.micros()
                while (pins.digitalReadPin(dht11pin) === 0) {
                    if (control.micros() - startTime > DHT11_TIMEOUT) break
                }
                control.waitMicros(28)
                if (pins.digitalReadPin(dht11pin) === 1) {
                    buffer[dataBits] = 1
                }
            }
        } else { // V1
            // 1.start signal
            pins.digitalWritePin(dht11pin, 0)
            basic.pause(18)

            // 2.pull up and wait 40us
            pins.setPull(dht11pin, PinPullMode.PullUp)
            pins.digitalReadPin(dht11pin)
            control.waitMicros(40)

            // 3.read data
            if (pins.digitalReadPin(dht11pin) === 0) {
                while (pins.digitalReadPin(dht11pin) === 0);
                while (pins.digitalReadPin(dht11pin) === 1);

                for (let dataBits = 0; dataBits < 40; dataBits++) {
                    while (pins.digitalReadPin(dht11pin) === 1);
                    while (pins.digitalReadPin(dht11pin) === 0);
                    control.waitMicros(28)
                    if (pins.digitalReadPin(dht11pin) === 1) {
                        buffer[dataBits] = 1
                    }
                }
            }
        }

        for (let i = 0; i < 5; i++) {
            for (let j = 0; j < 8; j++) {
                if (buffer[8 * i + j] === 1) {
                    data[i] += 2 ** (7 - j)
                }
            }
        }

        if (((data[0] + data[1] + data[2] + data[3]) & 0xff) === data[4]) {
            dht11Humidity = data[0] + data[1] * 0.1
            dht11Temperature = data[2] + data[3] * 0.1
        }

        switch (dht11type) {
            case DHT11Type.DHT11_temperature_C:
                return dht11Temperature
            case DHT11Type.DHT11_temperature_F:
                return (dht11Temperature * 1.8) + 32
            case DHT11Type.DHT11_humidity:
                return dht11Humidity
        }
    }

    // 그룹 5: Servo 365 관련
    // -----------------------------------------------------------------------------
    /**
        * Spins the motor in one direction at full speed
        * @param pin Which pin the motor is on
        */
    //% group="Servo 365"
    //% color=#2b569b
    //% blockId=spin_one_way weight=100
    //% block="spin one way pin %pin"
    export function spin_one_way(pin = AnalogPin.P1): void {
        pins.servoWritePin(pin, 180)
    }

    /**
    * Spins the motor in other direction at full speed
    * @param pin Which pin the motor is on
    */
    //% group="Servo 365"
    //% color=#2b569b
    //% blockId=spin_other_way weight=80
    //% block="spin other way pin %pin"
    export function spin_other_way(pin = AnalogPin.P2): void {
        pins.servoWritePin(pin, 0)
    }

    /**
    * Spins the motor in one direction, with a speed from 0 to 100
    * @param pin Which pin the motor is on
    * @param speed Speed from 0 to 100
    */
    //% group="Servo 365"
    //% color=#2b569b
    //% blockId=spin_one_way_with_speed weight=60
    //% block="spin one way pin %pin | with speed %speed"
    //% speed.min=0 speed.max=100
    export function spin_one_way_with_speed(pin = AnalogPin.P1, speed = 50): void {
        let spin = (speed * 90) / 100 + 90
        pins.servoWritePin(pin, spin)
    }

    /**
    * Spins the motor in the other direction, with a speed from 0 to 100
    * @param pin Which pin the motor is on
    * @param speed Speed from 0 to 100
    */
    //% group="Servo 365"
    //% color=#2b569b
    //% blockId=spin_other_way_with_speed weight=40
    //% block="spin other way pin %pin | with speed %speed"
    //% speed.min=0 speed.max=100
    export function spin_other_way_with_speed(pin = AnalogPin.P2, speed = 50): void {
        let spin = 90 - (speed * 90) / 100
        pins.servoWritePin(pin, spin)
    }

    /**
    * Turns off the motor at this pin
    * @param pin Which pin the motor is on
    */
    //% group="Servo 365"
    //% color=#2b569b
    //% blockId=turn_off_motor weight=20
    //% block="turn off motor at pin %pin"
    export function turn_off_motor(pin = DigitalPin.P1): void {
        pins.digitalWritePin(pin, 0)
    }
}