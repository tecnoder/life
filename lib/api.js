import ambulancesObjects from '@data/ambulance_v2.json';
import stateObjects from '@data/states.json';
import oxygenObjects from '@data/oxygen_v2.json';
import medicineObjects from '@data/medicine_v2.json';
import hospitalObjects from '@data/hospital_v2.json';
import helplineObjects from '@data/helpline_v2.json';
import oxygenRequirements from '@data/requirement_data.json';
import vaccineObjects from '@data/vaccine_v2.json';
import { activeDistricts, activeStates, isVerified, parametreize } from './utils';

class get {
    constructor(object, type) {
        this.object = object;
        this.type = type;
    }

    from(state, district, isSortingRequired, checkLocationIfExist) {
        let obs = this.object['data']
        if (state && district) {
            obs = obs.filter(
                (p) => parametreize(p.state) == state && parametreize(p.district) == district
            );
        }
        if (checkLocationIfExist) {
            obs = obs.filter(
                (p) => Boolean(p.latitude && p.longitude)
            );
        }
        if (isSortingRequired) {
            obs = this.sortByVerified(obs);
        }
        obs = obs.map((e) => ({ ...e, type: this.type }));
        return obs;
    }

    sortByVerified(listings) {
        let verified = [];
        const unverified = [];

        listings.map((listing) => {
            if (isVerified(listing.verificationStatus)) {
                verified.push(listing);
            } else {
                unverified.push(listing);
            }
        });
        verified = this.sortVerifiedByDate(verified);
        return [...verified, ...unverified];
    }

    sortVerifiedByDate(verified) {
        if (!verified) {
            return [];
        }
        verified.sort(function (a, b) {
            var keyA = new Date(a.lastVerifiedOn),
                keyB = new Date(b.lastVerifiedOn);
            // Compare the 2 dates
            if (keyA > keyB) return -1;
            if (keyA < keyB) return 1;
            return 0;
        });
        return verified;
    }
}
export function getAmbulances(state, district, isSortingRequired, checkLocationIfExist) {
    return new get(ambulancesObjects, 'Ambulance').from(state, district, isSortingRequired, checkLocationIfExist);
}
export function getOxygen(state, district, isSortingRequired, checkLocationIfExist) {
    return new get(oxygenObjects, 'Oxygen').from(state, district, isSortingRequired, checkLocationIfExist);
}
export function medicineByDistrict(state, district, isSortingRequired, checkLocationIfExist) {
    return new get(medicineObjects, 'Medicine').from(state, district, isSortingRequired, checkLocationIfExist);
}
export function hospitalByDistrict(state, district, isSortingRequired, checkLocationIfExist) {
    return new get(hospitalObjects, 'Hospital').from(state, district, isSortingRequired, checkLocationIfExist);
}
export function helplineByDistrict(state, district, isSortingRequired, checkLocationIfExist) {
    return new get(helplineObjects, 'Helpline').from(state, district, isSortingRequired, checkLocationIfExist);
}
export function getVaccine(state, district, isSortingRequired, checkLocationIfExist) {
    return new get(vaccineObjects, 'Vaccine').from(state, district, isSortingRequired, checkLocationIfExist);
}
export function getStates(page = 'all') {
    return activeStates(activeDistricts(page)).sort();
}

export function statesAndDistrict() {
    return stateObjects;
}

export const districtWithState = (page = 'all') => activeDistricts(page);

export function getDistricts(state) {
    return activeDistricts('all').filter((f) => parametreize(f.state) == state);
}

export function getOxygenRequirements() {
    return oxygenRequirements;
}

export const totalResources = () => {
    return (
        ambulancesObjects.data.length +
        oxygenObjects.data.length +
        medicineObjects.data.length +
        hospitalObjects.data.length +
        helplineObjects.data.length +
        vaccineObjects.data.length
    );
};
