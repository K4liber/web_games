const UP = true
const DOWN = false

type SingletonOracleMemory = {
    angle: number
    spin: boolean
}

interface QuantumOracle {
    getSpin(measurementAngle: number): boolean
}

class SingletonOracle implements QuantumOracle{

    private memory: SingletonOracleMemory | null = null;

    getSpin(measurementAngle: number): boolean {
        if (this.memory === null) {
            this.memory = {
                angle: measurementAngle,
                spin: Math.sin(Math.random() * 2 * Math.PI) > 0
            }
            return this.memory.spin
        } else {
            let radians = Math.PI * (measurementAngle - this.memory.angle) / 180
            let min = -1 + Math.cos(radians/2)**2
            let random = Math.random()

            if ((min + random) > 0) {
                return this.memory.spin
            } else {
                return !this.memory.spin
            }
        }
    }
}

const UnknownSpin = null;

interface Paricle {
    measureSpin(mesurementAngle: number): number | boolean
    setQuantumOracle(quantumOracle: QuantumOracle): void
    getSpin(): number | boolean
}

class Photon implements Paricle {
    private spin: boolean | null = UnknownSpin;
    private quantumOracle: QuantumOracle | null = null;

    measureSpin(mesurementAngle: number): boolean {
        if (this.spin !== UnknownSpin) {
            return this.spin
        } else if (this.quantumOracle !== null) {
            this.spin = this.quantumOracle.getSpin(mesurementAngle)
            return this.spin
        } else {
            this.spin = Math.random() >= 0.5
            return this.spin
        }
    }

    getSpin(): boolean {
        if (this.spin !== UnknownSpin) {
            return this.spin
        } else {
            throw new Error('The spin was not measured!')
        }
    }

    setQuantumOracle(quantumOracle: QuantumOracle): void {
        this.quantumOracle = quantumOracle
    }
}

class PhotonsSinglet {
    constructor(
        public particleA: Photon,
        public partivleB: Photon
    ){}
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
    entangle() {
        let singletonOracle = new SingletonOracle()
        this.particleA.setQuantumOracle(singletonOracle)
        this.partivleB.setQuantumOracle(singletonOracle)
    }
}


class SpinMeasuringInstrument {
    makeMeasurement(
        particle: Paricle,
        measurementAngle: number
    ) {
        particle.measureSpin(measurementAngle)
    }
}

const xDegrees = 0
const yDegrees = 60
const zDegrees = 120
const vDegrees = 180
const numberOfPairs = 100000

const makeExperiment = (
    particleAMeasurementAngle: number,
    particleBMeasurementAngle: number,
    expectedResult: number
) => {
    var entangledPairs = Array.from({length: numberOfPairs}, (): PhotonsSinglet => {
        return new PhotonsSinglet(new Photon(), new Photon())
    })
    let controlGroupPairs = Array.from({length: numberOfPairs}, (): PhotonsSinglet => {
        return new PhotonsSinglet(new Photon(), new Photon())
    })
    // We entangle the entangledPairs and we leave alone the controlGroupPairs
    entangledPairs.forEach((photonsSingleton) => {
        photonsSingleton.entangle()
    })
    var spinMeasuringInstrumentAlice = new SpinMeasuringInstrument()
    var spinMeasuringInstrumentBob = new SpinMeasuringInstrument()
    // We take one instrument and the first particle from each pair to Poland
    // We take second instrument and the second particle from each pair to Spain
    var theSameSpins = 0
    var theSameSpinsControlGroup = 0
    var upSpins = 0
    var upSpinsControlGroup = 0

    Array.from({length: numberOfPairs}, (index) => index).forEach((_, index) => {
        let entangledPair = entangledPairs[index]
        let particleAlice = entangledPair.particleA
        let particleBob = entangledPair.partivleB
        spinMeasuringInstrumentAlice.makeMeasurement(particleAlice, particleAMeasurementAngle)
        spinMeasuringInstrumentBob.makeMeasurement(particleBob, particleBMeasurementAngle)
        
        if (particleAlice.getSpin() === particleBob.getSpin()) {
            theSameSpins += 1
        }

        if (particleAlice.getSpin()) {
            upSpins += 1
        }


        let particleAliceControlGroup = controlGroupPairs[index].particleA
        let particleBobControlGroup = controlGroupPairs[index].partivleB
        spinMeasuringInstrumentAlice.makeMeasurement(particleAliceControlGroup, particleAMeasurementAngle)
        spinMeasuringInstrumentBob.makeMeasurement(particleBobControlGroup, particleBMeasurementAngle)

        if (particleAliceControlGroup.getSpin() === particleBobControlGroup.getSpin()) {
            theSameSpinsControlGroup += 1
        }

        if (particleAliceControlGroup.getSpin()) {
            upSpinsControlGroup += 1
        }

    })

    let controlGroupResults = 100.0 * theSameSpinsControlGroup/numberOfPairs
    console.log('***** Experiment results for angles difference = ' + 
        Math.abs(particleAMeasurementAngle - particleBMeasurementAngle) + 
        ' *****'
    )
    console.log('[Control group] results: ' + controlGroupResults + "%")
    console.assert(Math.round(controlGroupResults) === 50)
    console.log('[Control group] random UP spins: ' + 100 * upSpinsControlGroup/numberOfPairs + '%')
    let results = 100.0 * theSameSpins/numberOfPairs
    console.log('[Entanglement] results: ' + results + "%")
    console.assert(Math.round(results) === expectedResult)
    console.log('[Entanglement] random UP spins: ' + 100 * upSpins/numberOfPairs + '%')
}

makeExperiment(xDegrees, xDegrees, 100)
makeExperiment(xDegrees, yDegrees, 75)
makeExperiment(yDegrees, zDegrees, 75)  
makeExperiment(xDegrees, zDegrees, 25)
makeExperiment(yDegrees, vDegrees, 25)
makeExperiment(xDegrees, vDegrees, 0)
