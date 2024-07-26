import * as shell from "shelljs";

//Copy all the templates
shell.cp("-R", "src/templates", "dist/");
