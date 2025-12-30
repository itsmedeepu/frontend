// @ts-ignore
import { driver } from "driver.js";
import "driver.js/dist/driver.css";

export const startTour = () => {
  const driverObj = driver({
    showProgress: true,
    steps: [
      { 
        popover: { 
          title: "Welcome to AgriDirect! 🌱", 
          description: "Let's take a quick tour to help you get started.",
          side: "left", 
          align: 'start' 
        } 
      },
      { 
        element: "#nav-logo", 
        popover: { 
          title: "Home", 
          description: "Click here anytime to return to the marketplace homepage.", 
          side: "bottom", 
          align: 'start' 
        } 
      },
      { 
        element: "#nav-farms", 
        popover: { 
          title: "Explore Farms", 
          description: "Discover local farms and view their specific produce.", 
          side: "bottom", 
          align: 'start' 
        } 
      },
      { 
        element: "#nav-dashboard", 
        popover: { 
          title: "Your Dashboard", 
          description: "Manage your profile, view orders, and track deliveries here.", 
          side: "bottom", 
          align: 'start' 
        } 
      },
      { 
        element: "#nav-cart", 
        popover: { 
          title: "Shopping Cart", 
          description: "View items you've added and proceed to checkout.", 
          side: "bottom", 
          align: 'end' 
        } 
      },
      { 
        element: "#home-search", 
        popover: { 
          title: "Smart Search", 
          description: "Find exactly what you need by searching for products.", 
          side: "bottom", 
          align: 'start' 
        } 
      },
      { 
        element: "#home-categories", 
        popover: { 
          title: "Categories", 
          description: "Filter products by Veggies, Fruits, Seeds, and more.", 
          side: "top", 
          align: 'start' 
        } 
      },
      { 
        popover: { 
          title: "You're All Set! 🚀", 
          description: "Start exploring fresh produce from local farmers now.", 
          side: "top", 
          align: 'start' 
        } 
      }
    ]
  });

  driverObj.drive();
};
