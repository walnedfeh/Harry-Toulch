import { ZCodeMatch } from "../models/z-code-match"
import { ZCodeMatchApi } from "../models/z-code-match-api";
import { ZCodeMatchedFields } from "../models/z-code-matched-fields"

export function ReverseZcodesMatchingFields(matches: ZCodeMatch[]): ZCodeMatchedFields[] {
    let result: ZCodeMatchedFields[] = [];
    matches.forEach(x => {
        x.zCodes.forEach(y => {
            if (!result.filter(r => r.zCode == y)[0]) {
                let temp: ZCodeMatchedFields = new ZCodeMatchedFields();
                temp.zCode = y;
                temp.zCodeFields.push(x.MatchedField);
                result.push(temp);
            } else {
                let index = result.findIndex(o => o.zCode == y);
                if (!result[index].zCodeFields.filter(h => h == x.MatchedField)[0]) {
                    result[index].zCodeFields.push(x.MatchedField);
                }
            }
        });
    });
    return result;
}


export function PrepareMatchedZcodeFieldsApi(matches: ZCodeMatchedFields[]): ZCodeMatchApi[] {
    let result: ZCodeMatchApi[] = [];
    matches.forEach(x => {
        let temp: ZCodeMatchApi = new ZCodeMatchApi();
        temp.MatchedFields = x.zCodeFields.map(t => {
            return t;
        }).join(',');
        temp.zCode = x.zCode;
        result.push(temp);
    });
    return result;
}