import useWindowDimensions from "./useWindowDimensions";

export enum Environment {
    MOBILE,
    DESKTOP
}

export default function useEnvironment(): Environment {
    const { width } = useWindowDimensions()

    if (width <= 500) {
        return Environment.MOBILE
    } else {
        return Environment.DESKTOP
    }
}