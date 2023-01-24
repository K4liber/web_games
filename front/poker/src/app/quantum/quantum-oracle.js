var UP = true;
var DOWN = false;
var SingletonOracle = /** @class */ (function () {
    function SingletonOracle() {
        this.memory = null;
    }
    SingletonOracle.prototype.getSpin = function (measurementAngle) {
        if (this.memory === null) {
            this.memory = {
                angle: measurementAngle,
                spin: Math.sin(Math.random() * 2 * Math.PI) > 0
            };
            return this.memory.spin;
        }
        else {
            var radians = Math.PI * (measurementAngle - this.memory.angle) / 180;
            var min = -1 + Math.pow(Math.cos(radians / 2), 2);
            var random = Math.random();
            if ((min + random) > 0) {
                return this.memory.spin;
            }
            else {
                return !this.memory.spin;
            }
        }
    };
    return SingletonOracle;
}());
var UnknownSpin = null;
var Photon = /** @class */ (function () {
    function Photon() {
        this.spin = UnknownSpin;
        this.quantumOracle = null;
    }
    Photon.prototype.measureSpin = function (mesurementAngle) {
        if (this.spin !== UnknownSpin) {
            return this.spin;
        }
        else if (this.quantumOracle !== null) {
            this.spin = this.quantumOracle.getSpin(mesurementAngle);
            return this.spin;
        }
        else {
            this.spin = Math.random() >= 0.5;
            return this.spin;
        }
    };
    Photon.prototype.getSpin = function () {
        if (this.spin !== UnknownSpin) {
            return this.spin;
        }
        else {
            throw new Error('The spin was not measured!');
        }
    };
    Photon.prototype.setQuantumOracle = function (quantumOracle) {
        this.quantumOracle = quantumOracle;
    };
    return Photon;
}());
var PhotonsSinglet = /** @class */ (function () {
    function PhotonsSinglet(particleA, partivleB) {
        this.particleA = particleA;
        this.partivleB = partivleB;
    }
    /**
        Create maximally entangled state of two particles with spin 1/2,
        the so-called singlet.
        One method is to cool the particles
        and place them close enough together
        so that their quantum states
        (representing the uncertainty in the position)
        overlap, making it impossible to distinguish
        one particle from the other.
    */
    PhotonsSinglet.prototype.entangle = function () {
        var singletonOracle = new SingletonOracle();
        this.particleA.setQuantumOracle(singletonOracle);
        this.partivleB.setQuantumOracle(singletonOracle);
    };
    return PhotonsSinglet;
}());
var SpinMeasuringInstrument = /** @class */ (function () {
    function SpinMeasuringInstrument() {
    }
    SpinMeasuringInstrument.prototype.makeMeasurement = function (particle, measurementAngle) {
        particle.measureSpin(measurementAngle);
    };
    return SpinMeasuringInstrument;
}());
var xDegrees = 0;
var yDegrees = 60;
var zDegrees = 120;
var vDegrees = 180;
var numberOfPairs = 100000;
var makeExperiment = function (particleAMeasurementAngle, particleBMeasurementAngle, expectedResult) {
    var entangledPairs = Array.from({ length: numberOfPairs }, function () {
        return new PhotonsSinglet(new Photon(), new Photon());
    });
    var controlGroupPairs = Array.from({ length: numberOfPairs }, function () {
        return new PhotonsSinglet(new Photon(), new Photon());
    });
    // We entangle the entangledPairs and we leave alone the controlGroupPairs
    entangledPairs.forEach(function (photonsSingleton) {
        photonsSingleton.entangle();
    });
    var spinMeasuringInstrumentAlice = new SpinMeasuringInstrument();
    var spinMeasuringInstrumentBob = new SpinMeasuringInstrument();
    // We take one instrument and the first particle from each pair to Poland
    // We take second instrument and the second particle from each pair to Spain
    var theSameSpins = 0;
    var theSameSpinsControlGroup = 0;
    var upSpins = 0;
    var upSpinsControlGroup = 0;
    Array.from({ length: numberOfPairs }, function (index) { return index; }).forEach(function (_, index) {
        var entangledPair = entangledPairs[index];
        var particleAlice = entangledPair.particleA;
        var particleBob = entangledPair.partivleB;
        spinMeasuringInstrumentAlice.makeMeasurement(particleAlice, particleAMeasurementAngle);
        spinMeasuringInstrumentBob.makeMeasurement(particleBob, particleBMeasurementAngle);
        if (particleAlice.getSpin() === particleBob.getSpin()) {
            theSameSpins += 1;
        }
        if (particleAlice.getSpin()) {
            upSpins += 1;
        }
        var particleAliceControlGroup = controlGroupPairs[index].particleA;
        var particleBobControlGroup = controlGroupPairs[index].partivleB;
        spinMeasuringInstrumentAlice.makeMeasurement(particleAliceControlGroup, particleAMeasurementAngle);
        spinMeasuringInstrumentBob.makeMeasurement(particleBobControlGroup, particleBMeasurementAngle);
        if (particleAliceControlGroup.getSpin() === particleBobControlGroup.getSpin()) {
            theSameSpinsControlGroup += 1;
        }
        if (particleAliceControlGroup.getSpin()) {
            upSpinsControlGroup += 1;
        }
    });
    var controlGroupResults = 100.0 * theSameSpinsControlGroup / numberOfPairs;
    console.log('***** Experiment results for angles difference = ' +
        Math.abs(particleAMeasurementAngle - particleBMeasurementAngle) +
        ' *****');
    console.log('[Control group] results: ' + controlGroupResults + "%");
    console.assert(Math.round(controlGroupResults) === 50);
    console.log('[Control group] random UP spins: ' + 100 * upSpinsControlGroup / numberOfPairs + '%');
    var results = 100.0 * theSameSpins / numberOfPairs;
    console.log('[Entanglement] results: ' + results + "%");
    console.assert(Math.round(results) === expectedResult);
    console.log('[Entanglement] random UP spins: ' + 100 * upSpins / numberOfPairs + '%');
};
makeExperiment(xDegrees, xDegrees, 100);
makeExperiment(xDegrees, yDegrees, 75);
makeExperiment(yDegrees, zDegrees, 75);
makeExperiment(xDegrees, zDegrees, 25);
makeExperiment(yDegrees, vDegrees, 25);
makeExperiment(xDegrees, vDegrees, 0);
