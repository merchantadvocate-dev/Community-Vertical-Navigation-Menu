/* eslint-disable dot-notation */
/* eslint-disable vars-on-top */
/* eslint-disable no-console */
import { LightningElement, api, wire } from 'lwc';
import { CurrentPageReference, NavigationMixin } from 'lightning/navigation';
import HAMBURGER_ICON from '@salesforce/resourceUrl/hamburgerLogo';
import X_ICON from '@salesforce/resourceUrl/MALogo';
import isGuestUser from '@salesforce/user/isGuest';
import { getRecord } from 'lightning/uiRecordApi';
import USER_ID from '@salesforce/user/Id'; //this is how you will retreive the USER ID of current in user.
import NAME_FIELD from '@salesforce/schema/User.Name';
import basePath from '@salesforce/community/basePath';
import FORM_FACTOR from '@salesforce/client/formFactor'
import getNavigationMenuItems from '@salesforce/apex/NavigationMenuItemsController.getNavigationMenuItems';

/*
 * This is a custom LWC navigation menu component.
 * Make sure the Guest user profile has access to the NavigationMenuItemsController apex class.
*/
export default class NavigationMenu extends NavigationMixin(LightningElement) {
    @api menuName;

    error;
    publishedState;
    deviceType;
    showHamburgerMenu;
    menuItems;
    clientName;

    href = basePath;
    isGuest = isGuestUser;
    showLogo = true;

    hamburgerIcon = HAMBURGER_ICON;
    xIcon = X_ICON;

    connectedCallback() {
        if (FORM_FACTOR === "Large") {
          this.deviceType = "Desktop/Laptop";
          this.showLogo = true;
        } else if (FORM_FACTOR === "Medium") {
          this.deviceType = "Tablet";
          this.showLogo = true;
        } else if (FORM_FACTOR === "Small") {
          this.deviceType = "Mobile";
          this.showLogo = false;
        }
      }

    @wire(CurrentPageReference)
        setCurrentPageReference(currentPageReference) {
        const app =
            currentPageReference &&
            currentPageReference.state &&
            currentPageReference.state.app;
        if (app === 'commeditor') {
            this.publishedState = 'Draft';
        } else {
            this.publishedState = 'Live';
        }
    }

    @wire(getRecord, {
        recordId: USER_ID,
        fields: [NAME_FIELD]
    }) wireuser({
        error,
        data
    }) {
        if (error) {
           this.error = error ; 
        } else if (data) {
            this.clientName = data.fields.Name.value;
        }
    }

    @wire(getNavigationMenuItems, {
        menuName: '$menuName',
        publishedState: '$publishedState'
    })
    wiredMenuItems({ error, data }) {
        if (data) {
            // console.log(data);
            this.menuItems = data
            this.error = undefined;
        } else if (error) {
            this.error = error;
            this.menuItems = [];
            // console.log('Navigation menu error: ${JSON.stringify(this.error)}');
        }
    }

    handleSelect(event) {
        const selectedName = event.detail.name;
         // console.log(selectedName);
         // console.log(this.menuItems);

        event.preventDefault();
        event.stopPropagation();

        let menuResults = this.menuItems;
        menuResults.forEach(item => { 
            
            let mName = item.Label.toLowerCase().replace(/\s+/g, '');
            if (mName === selectedName) {
                // console.log(item.Label);
                // console.log(item.Target);
                // console.log(item.Type);
                
                if (item.Type === 'InternalLink') {
                    this.navigateToPage(basePath + item.Target);

                } else if (item.Type === 'Event') {
                    // Logout                  
                    this.handlelogout();
                }
            }
            
        });

    }

    handlelogout(){
        this[NavigationMixin.Navigate]({
          type: 'comm__loginPage',
          attributes: {
            actionName: 'logout'
          },
        }); 
    }

    navigateToPage(pagename) {
        this[NavigationMixin.Navigate]({
            type: 'standard__webPage',
            attributes: {
                url: pagename
            }
        });
    }
    

    handleHamburgerMenuToggle(evt) {
        evt.stopPropagation();
        evt.preventDefault();
        if (this.showHamburgerMenu) {
            this.showHamburgerMenu = false;
        } else {
            this.showHamburgerMenu = true;
        }
    }
}
