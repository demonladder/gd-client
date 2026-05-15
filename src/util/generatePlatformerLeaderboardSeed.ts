export function generatePlatformerLeaderboardSeed(bestTime: number, bestPoints: number) {
    return (
        (((((bestTime + 7890) % 34567) * 601 + ((Math.abs(bestPoints) + 3456) % 78901) * 967 + 94819) % 94433) * 829) %
        77849
    );
}
