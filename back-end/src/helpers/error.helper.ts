import { SafeParseError } from "zod";

export function parseError<T>(parseResult: SafeParseError<T>): string {
  const issues = { ...parseResult.error.issues };
  const errors: string[] = [];
  issues.map((issue) => {
    errors.push(`${issue.path.join(".")}: ${issue.message}`);
  });

  return errors.join(";\n\t");
}

/*
{
  "error": {
    "formErrors": [],
    "fieldErrors": {
      "code": [
        "String must contain at most 10 character(s)"
      ],
      "name": [
        "String must contain at most 50 character(s)"
      ],
      "contact": [
        "Invalid email"
      ]
    }
  }
}
*/
