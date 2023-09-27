import {test,expect} from "vitest"
import {getFileExtension } from "../src/utils/play"

test("extension",()=>{
    expect(getFileExtension("http://dsad.ds/test.mp4")).toBe("mp4")
})