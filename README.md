
<img width="450" src="https://repository-images.githubusercontent.com/238456483/0172db80-6c9a-11eb-87eb-6629ca713fef" alt=""/>

# WebStarterKit Template

Web starter kit build with gulp ❤️. Code like single page application and it's compile into regular HTML, CSS, JS files. Compression enabled by default for your all files. So your website will execute with minimum size that increases the performance and user experience.

#### src -
We will store our HTML,CSS,JS and Assets file here. Read HTML <a href="https://github.com/haoxins/gulp-file-include#fileincludeprefix">Component</a> usage here. 

#### gulpfile.js -

Gulp Configuration file.

#### package.json -

All dependency we saved here.

#### CLI Usage

`npm i -g webcreate-cli`

<table style="width:100%">
  <tr>
    <th>Type</th>
    <th>Parameter Name</th> 
    <th>Parameter Value</th>
  </tr>
  <tr>
    <td>Project</td>
    <td>--project</td>
    <td>Project Name</td>
  </tr>
   <tr>
    <td>Component</td>
    <td>--component</td>
    <td>Component Name</td>
  </tr>
    <tr>
    <td>version</td>
    <td>--v</td>
    <td>{deprecated} for the old files || Nothing for the latest files</td>
  </tr>
</table>

##### Create new project with this command -

`webcreate --project=ProjectName`


##### Create new project with old files run this command -

`webcreate --project=ProjectName --v=deprecated`

------------------

It will automatically download the template and install all dependency.

------------------

#### Create component -

`webcreate --component=componentName`

#### Run the project

`cd ProjectName`

`npm i` if the dependency (node_module) is not installed. 

`gulp` = Project build and run.

`gulp build` = Project will only build.

`gulp run` = Project only run if the build folder is available.

`gulp prod` = Project will build for production level.

##### &nbsp;

##### Package Link -

[WebCreate-CLI](https://www.npmjs.com/package/webcreate-cli)
