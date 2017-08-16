export type AnimatedType = {
    stopAnimation: () => void,
    interpolate: ({
        inputRange: Array<number> | Array<string>,
        outputRange: Array<number> | Array<string>
    }) => AnimatedType
};
