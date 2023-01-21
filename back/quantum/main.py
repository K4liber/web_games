import math
import random
from typing import Optional, Union


class HalfSpinValue:
    UP = True  # 1/2
    DOWN = False  # -1/2

HalfSpinType = bool
Unknown = None


class Entanglement:
    def __init__(self) -> None:
        self._angle: Optional[int] = None
        self._spin: HalfSpinType = \
            math.sin(math.radians(random.randint(0, 360))) > 0
        
    def get_spin(self, measurement_angle: int) -> HalfSpinType:
        if self._angle is None:
            self._angle = measurement_angle
            return self._spin
        else:
            radians = math.radians(measurement_angle - self._angle)

            if random.uniform(-1 + math.cos(radians/2)**2, math.cos(radians/2)**2) > 0:
                return self._spin
            else:
                return not self._spin


class ParticleHalfSpin:
    def __init__(self):
        self.spin: Union[HalfSpinType, Unknown] = Unknown
        self.entanglement: Optional[Entanglement] = None

    def measure_spin(self, measurement_angle: int) -> HalfSpinType:
        if self.spin is not None:
            return self.spin

        if self.entanglement is not None:
            self.spin = self.entanglement.get_spin(measurement_angle)
            return self.spin
        
        self.spin = bool(random.randint(0, 1))
        return self.spin


class QuantumPairOfParticles:
    def __init__(
        self,
        particle_a: ParticleHalfSpin,
        particle_b: ParticleHalfSpin
    ):
        self.particle_a = particle_a
        self.particle_b = particle_b

    def entangle(self):
        """
        Create maximally entangled state of two particles with spin 1/2, 
        the so-called singlet.
        One method is to cool the particles 
        and place them close enough together 
        so that their quantum states 
        (representing the uncertainty in the position) 
        overlap, making it impossible to distinguish 
        one particle from the other.
        """
        entanglement = Entanglement()
        self.particle_a.entanglement = entanglement
        self.particle_b.entanglement = entanglement


class SpinMeasuringInstrument:
    def make_measurement(
        self,
        particle_to_be_measured: ParticleHalfSpin,
        measurement_angle: int
    ):
        particle_to_be_measured.measure_spin(measurement_angle)

X = 0
Y = 60
Z = 120
V = 180
number_of_pairs = 100000


def make_experiment(
    angle_for_first_particle: int,
    angle_for_second_particle: int
) -> float:
    quantum_pairs = [
        QuantumPairOfParticles(ParticleHalfSpin(), ParticleHalfSpin()) 
        for _ in range(number_of_pairs)
    ]
    control_group_pairs = [
        QuantumPairOfParticles(ParticleHalfSpin(), ParticleHalfSpin()) 
        for _ in range(number_of_pairs)
    ]
    # We entangle the quantum_pairs and we leave alone the control_group_pairs
    for index in range(number_of_pairs):
        quantum_pairs[index].entangle()

    spin_measuring_instrument_poland = SpinMeasuringInstrument()
    spin_measuring_instrument_spain = SpinMeasuringInstrument()
    # We take one instrument and the first particle from each pair to Poland
    # We take second instrument and the second particle from each pair to Spain
    the_same_spins = 0
    the_same_spins_control_group = 0
    up_spins = 0
    up_spins_control_group = 0

    for index in range(number_of_pairs):
        particle_in_poland = quantum_pairs[index].particle_a
        particle_in_spain = quantum_pairs[index].particle_b
        spin_measuring_instrument_poland.make_measurement(particle_in_poland, angle_for_first_particle)
        spin_measuring_instrument_spain.make_measurement(particle_in_spain, angle_for_second_particle)

        if particle_in_poland.spin == particle_in_spain.spin:
            the_same_spins += 1

        if particle_in_poland.spin:
            up_spins += 1

        particle_in_poland_control_group = control_group_pairs[index].particle_a
        particle_in_spain_control_group = control_group_pairs[index].particle_b
        spin_measuring_instrument_poland.make_measurement(particle_in_poland_control_group, angle_for_first_particle)
        spin_measuring_instrument_spain.make_measurement(particle_in_spain_control_group, angle_for_second_particle)

        if particle_in_poland_control_group.spin == particle_in_spain_control_group.spin:
            the_same_spins_control_group += 1

        if particle_in_poland_control_group.spin:
            up_spins_control_group += 1

    control_group_results = 100.0 * the_same_spins_control_group/number_of_pairs
    print(f'Control group results: {control_group_results}%')
    assert round(control_group_results) == 50
    print(f'Random UP spins: {up_spins}/{number_of_pairs}')
    return 100.0 * the_same_spins/number_of_pairs


if __name__ == '__main__':
    ### Experiment 1 -> (X, X) or (Y, Y) or (Z, Z): 0 degrees difference ###
    experiment_1_results = make_experiment(X, X)
    print(f'Experiment 1 -> (X, X) or (Y, Y) or (Z, Z): 0 degrees difference, the same spin percent: {experiment_1_results}%')
    assert round(experiment_1_results) == 100
    ### Experiment 2 -> (X, Y): 60 degrees difference ###
    experiment_2_results = make_experiment(X, Y)
    print(f'Experiment 2 -> (X, Y): 60 degrees difference, the same spin percent: {experiment_2_results}%')
    assert round(experiment_2_results) == 75
    ### Experiment 2 -> (X, Y): 60 degrees difference ###
    experiment_3_results = make_experiment(Y, Z)
    print(f'Experiment 3 -> (Y, Z): 60 degrees difference, the same spin percent: {experiment_3_results}%')
    assert round(experiment_3_results) == 75
    ### Experiment 4 -> (X, Z): 120 degrees difference ###
    experiment_4_results = make_experiment(X, Z)
    print(f'Experiment 4 -> (X, Z): 120 degrees difference, the same spin percent: {experiment_4_results}%')
    assert round(experiment_4_results) == 25
    ### Experiment 5 -> (X, V): 180 degrees difference ###
    experiment_5_results = make_experiment(X, V)
    print(f'Experiment 5 -> (X, V): 180 degrees difference, the same spin percent: {experiment_5_results}%')
    assert round(experiment_5_results) == 0

# You can indirectly influnce the other particle from the pair but you cannot manipulate the value of the influence
# In other words: You cannot send any specific information, you can just inform the Oracle about your influence (measurement)
# https://www.youtube.com/watch?v=JFSU9X11wyY
# https://physics.stackexchange.com/questions/128848/why-would-classical-correlation-in-bells-experiment-be-a-linear-function-of-ang
# https://cds.cern.ch/record/111654/files/vol1p195-200_001.pdf
# https://www.youtube.com/watch?v=v657Ylwh-_k
# Quantum Entanglement is a kind of a forced correlation between particles (qubits)
