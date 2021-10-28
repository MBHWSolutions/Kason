# HWSCustomThemeSeed

# Setting up a new store.

HWS utilizes three main environments: development, stage, and production.
However, before these environments can be setup uStore Admin is used to setup both a production Store and it's corresponding Staging store. 

The staging store will be used for quality assurance testing as well as user acceptance testing. Staging will also be used as the backend repository for the development environment.

In addition, each store will have a corresponding Git Repository located at https://github.com/hw-solutions


# Development
The development environment is located on the developers workstation. 

Initialization of the individual store consist of the following two phases.

# Phase 1 Theme Initalization

From this theme (HWSCustomThemeSeed) run the following publish script.

npm run publish -- name=KASONDEV displayName="KASON - DEV"
Where the parameters are:

storeDevelopmentThemeName - The unique identifier of the store's development theme. There can be only one theme with this name on the server. The theme name can contain only letters, digits and underscore, and should be limited to 20 characters. The theme name is suffixed with the word DEV. 

developmentDisplayName - The development display name can be any string and suffixed with the word DEV.

The Publish command creates a package with the given development theme name. Ensure there are no errors in the terminal. A ZIP file with the new theme name is created under folder src/dist in the folder you've worked on to develop the theme. This is the theme package to upload.

Unzip this file into a directory that will be used as this store's local source control repository.

Start Visual Studion Code from that directory, within a terminal switch to the src directory and run npm install.

Make an initial commit and push to the store's git repository. 


# Phase 2: linking development to staging 

From the newly created development theme run the following publish script.

npm run publish -- name=KASONSTG displayName="KASON - STG"



Where the parameters are:

storeStagingThemeName - The unique identifier of the store's development theme. There can be only one theme with this name on the server. The theme name can contain only letters, digits and underscore, and should be limited to 20 characters. The theme name is suffixed with the word STG. 

stagingDisplayName - The staging display name can be any string and suffixed with the word STG.

The Publish command creates a package with the given staging theme name. Ensure there are no errors in the terminal. A ZIP file with the new staging theme name is created under folder src/dist in the folder you've worked on to develop the theme. This is the staging theme package to upload.

To assign the staging theme to a store do the following:

In the Back Office, select the staging store to which you want to assign the staging theme.

In Store setup > "Appearance" tab, navigate to the development repository's src/dist folder, select the required theme and then place the store online.

Click the "Preview" button to see the store with its new UI.

Within Visual Studio Code run

npm start -- server=https://ustore.hwsolutions.com/
http://localhost:5000/ustore?storeid=65&devmode=true&devthemename=Kason


# Staging
Each time you are ready to push to Staging rerun the publishing steps found in Phase 2 above and replace the server's staging theme with the newly created Staging theme. 


# Production
Once testing is completed and you're ready to publish to production then run.  

From the newly created development theme run the following publish script.


npm run publish -- name=SALTOPROD displayName="SALTO - PROD"
Where the parameters are:

storeProductionThemeName - The unique identifier of the store's production theme. There can be only one theme with this name on the server. The theme name can contain only letters, digits and underscore, and should be limited to 20 characters. The theme name is suffixed with the word PROD. 

productionDisplayName - The staging display name can be any string and suffixed with the word PROD.

The Publish command creates a package with the given development theme name. Ensure there are no errors in the terminal. A ZIP file with the new staging theme name is created under folder src/dist in the folder you've worked on to develop the theme. This is the production theme package to upload.

Replace the server's production theme with the newly created production theme. 