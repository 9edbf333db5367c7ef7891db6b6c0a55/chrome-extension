import config from './helpers/config';
import headerbar from './includes/headerbar';
import modal from './includes/modal';

$(document).ready(() => {
  // Check if the site loaded is one of the merchants we support
  // and is not AWS's console/console
  const hostname = location.hostname.replace('www.', '');
  const isNotAWSConsole = 'aws' in hostname.split('.');
  const isMerchant = $.inArray(hostname, config.merchants);
  if (isMerchant > -1 && !isNotAWSConsole) {
    // Add logic once headerbar & modal box have been injected and compiled
    Promise.all([headerbar(), modal()]).then(() => {
      // VM headerbar and modal loaded up into the page
    });
  }
});
