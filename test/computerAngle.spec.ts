import { test,expect } from "vitest"
import {computeAngle} from "../src/utils/play"
test("computAngle",() => {
    expect(computeAngle(0,90)).toBe(90);
})