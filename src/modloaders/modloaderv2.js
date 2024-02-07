(function() {

    let version = VERSION.version() //1.4, 1.4.4, or CTLE
    if(version === "1.4") {
        timers = [500, 5000]
    } else { //1.4.4 or CTLE
        timers = [100, 2000]
    }

    var runtime;

    function sleep (time) {
        return new Promise((resolve) => setTimeout(resolve, time));
    }

    let onFinishLoad = () => {
        if ((cr_getC2Runtime() || {isloading: true}).isloading) {
            setTimeout(onFinishLoad, timers[0]);
        } else {
            if(version === "1.4") {
                var Retron2000 = new FontFace('Retron2000', 'url(./retron2000.ttf)');
                Retron2000.load().then(function(loaded_face) {
                    document.fonts.add(loaded_face);
                    document.body.style.fontFamily = '"Retron2000", Arial';
                console.log("123123")
                }).catch(function(error) {
                    console.log(error)
                });
                runtime = cr_getC2Runtime();

                let old = globalThis.sdk_runtime;
                c2_callFunction("execCode", ["globalThis.sdk_runtime = this.runtime"]);
                //runtime = globalThis.sdk_runtime;
                globalThis.sdk_runtime = old;
            } else { //1.4.4 or CTLE
                runtime = cr_getC2Runtime();
            }
            sleep(timers[1]).then(() => {
                cleanModLoader.init();
            });
        }
    }

    //general 
    var map = null;
    var map2 = null;

    var customModNum = 0;
    

    
    
    



    let isInLevel = () => {
        return runtime.running_layout.name.startsWith("Level")
    };
    let isPaused = () => {
        if (isInLevel()) return runtime.running_layout.layers.find(function(a) {
            return "Pause" === a.name
        }).visible
    };
    
    let closePaused = () => {
        if (isInLevel()) return runtime.running_layout.layers.find(function(a) {return "Pause" === a.name}).visible = false
    }



    let disableScroll = () => {
        let map = [];
        let mapUI = [];
        let types = runtime.types_by_index.filter((x) =>
          x.behaviors.some(
            (y) => y.behavior instanceof cr.behaviors.aekiro_scrollView
          )
        );
        types.forEach((type) => {
          type.instances.forEach((inst) => {
            let behavior = inst.behavior_insts.find(
              (x) => x.behavior instanceof cr.behaviors.aekiro_scrollView
            );
            console.log(behavior)
            console.log(behavior.scroll.isEnabled)
            map.push({
              inst,
              oldState: behavior.scroll.isEnabled,
            });
            behavior.scroll.isEnabled = false;
          });
        });
        let layer = runtime.running_layout.layers.find((x) => x.name == "UI");
        if (layer) {
          layer.instances.forEach((inst) => {
            //save state to mapUI
            mapUI.push({
              inst,
              oldState: {
                width: inst.width,
                height: inst.height,
              },
            });
            // set size to 0
            inst.width = 0;
            inst.height = 0;
            inst.set_bbox_changed();
          });
        }
        return {
          map,
          mapUI,
        };
      };

    let enableScroll = ({ map, mapUI }) => {
        map.forEach((x) => {
          let inst = x.inst.behavior_insts.find(
            (x) => x.behavior instanceof cr.behaviors.aekiro_scrollView
          );
          inst.scroll.isEnabled = inst.scroll.isEnabled ? 1 : x.oldState;
        });
        mapUI.forEach((x) => {
          x.inst.width = x.oldState.width;
          x.inst.height = x.oldState.height;
          x.inst.set_bbox_changed();
        });
      };

    
    let disableClick = () => {
        let map = [];
        let mapUI = [];
        let types = runtime.types_by_index.filter((x) =>
          x.behaviors.some(
            (y) => y.behavior instanceof cr.behaviors.aekiro_button
          )
        );
        types.forEach((type) => {
          type.instances.forEach((inst) => {
            let behavior = inst.behavior_insts.find(
              (x) => x.behavior instanceof cr.behaviors.aekiro_button
            );
            // console.log(behavior)
            // console.log(behavior.isEnabled)
            map.push({
              inst,
              oldState: behavior.isEnabled,
            });
            behavior.isEnabled = 0;
          });
        });
        let layer = runtime.running_layout.layers.find((x) => x.name == "UI");
        if (layer) {
          layer.instances.forEach((inst) => {
            //save state to mapUI
            mapUI.push({
              inst,
              oldState: {
                width: inst.width,
                height: inst.height,
              },
            });
            // set size to 0
            inst.width = 0;
            inst.height = 0;
            inst.set_bbox_changed();
          });
        }
        return {
          map,
          mapUI,
        };
      };

      let enableClick = ({ map, mapUI }) => {
        map.forEach((x) => {
          let inst = x.inst.behavior_insts.find(
            (x) => x.behavior instanceof cr.behaviors.aekiro_button
          );
          inst.isEnabled = inst.isEnabled ? 1 : x.oldState;
        });
        mapUI.forEach((x) => {
          x.inst.width = x.oldState.width;
          x.inst.height = x.oldState.height;
          x.inst.set_bbox_changed();
        });
      };


    
    let notify = (title, text, image = "./speedrunner.png") => {
        cr.plugins_.sirg_notifications.prototype.acts.AddSimpleNotification.call(
            runtime.types_by_index.find(
                (type) => type.plugin instanceof cr.plugins_.sirg_notifications
            ).instances[0],
            title,
            text,
            image
        );
    };


    
    
    let detectDeviceType = () => 
    /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent) ? 'mobile' : 'pc';


    
    let createMenuButton = (id, text, width) => {
        let menuButton = document.createElement("button");
        menuButton.id = id;
        menuButton.innerHTML = text;

        let c = {
          fontFamily: "Retron2000",
          color: "black",
          fontSize: "2vw",
          // cursor: "pointer",
          backgroundColor: "white",
          width: width,
          textAlign: "center",
          border: "solid 2px black",

          // height: "auto",
        }
        Object.keys(c).forEach(function (a) {
          menuButton.style[a] = c[a];
        });
        return menuButton;
    }

    let createMenuCard = (id, text, width) => {
      let menuCard = document.createElement("div");
      menuCard.id = id;
      // menuCard.innerHTML = text;
 
      let c = {
        fontFamily: "Retron2000",
        color: "black",
        fontSize: "2vw",
        // cursor: "pointer",
        backgroundColor: "white",
        width: width,
        height: "200px",
        textAlign: "center",
        border: "solid 2px black",
        marginLeft: "5px",
        marginRight: "5px",
        flex: "1 0 calc(33% - 15px)",
        maxWidth: "calc(33% - 15px)",
        // height: "auto",
      }
      Object.keys(c).forEach(function (a) {
        menuCard.style[a] = c[a];
      });
      return menuCard;
    }



    let createModLoaderMenuBtn = () => {
      menuButton = document.createElement("button");
      c = {
          background: "url(https://cdn-icons-png.flaticon.com/512/2099/2099192.png)",
          backgroundSize: "cover", //or contain
          backgroundColor: "white",
          border: "none", //2p solid black
          position: "absolute",
          cursor: "pointer",
          left: "4px",
          top: "2px",
          width: "100px",
          height: "100px",
          display: "block",
          zIndex: "2147483647",
      };
      Object.keys(c).forEach(function (a) {
          menuButton.style[a] = c[a];
      });
      menuButton.id = "menu-button";


      menuButton.onclick = function() {
          if(document.getElementById("menu-bg") === null) { //if menu doesnt exist, to avoid duplicates
              map = disableClick();
              createModLoaderMenu();
              document.getElementById("menu-button").style.display = "none";
          } 
      }
      document.body.appendChild(menuButton);

    }
    let createModLoaderMenu = () => {
      //Create background div
      menuBg = document.createElement("div")
      c = {
          justifyContent: "center",
          alignItems: "center",
          top: "50%",
          left: "50%",
          transform: "translate(-50%, -50%)",
          backgroundColor: "white",
          border: "solid",
          borderColor: "black",
          borderWidth: "2px",
          fontFamily: "Retron2000",
          position: "absolute",
          cursor: "default",
          padding: "5px",
          color: "black",
          fontSize: "10pt",
          display: "block",
          width: "90%",
          height: "90%",
          overflowY: "auto",
          overflowX: "hidden",
      };
      Object.keys(c).forEach(function (a) {
          menuBg.style[a] = c[a];
      });
      menuBg.id = "menu-bg";
      

      navbar = document.createElement("nav");
      c = {
        display: "flex",
        alignItems: "center",
        justifyContent: "space-between",
        padding: "5px",
        position: "relative",
        // backgroundColor: "#f2f2f2",
      }
      Object.keys(c).forEach(function (a) {
          navbar.style[a] = c[a];
      });
      navbar.id = "navbar";

      logo = document.createElement("img");
      c = {
          width: "50px",
          height: "50px",
          display: "block",
          cursor: "pointer",
      };
      Object.keys(c).forEach(function (a) {
          logo.style[a] = c[a];
      });
      logo.src = "../assets/img/dimensions.png";
      logo.onclick = function() {
          window.location.href = "../";
      }
      navbar.appendChild(logo);

      //Title
      titleText = document.createElement("div");
      c = {
          backgroundColor: "white",
          border: "none",
          fontFamily: "Retron2000",
          // position: "relative",
          // top: "2%",
          //left: "35%",
          color: "black",
          fontSize: "28pt",
          cursor: "default",
          margin: "0",
          // textAlign: "center",
      };
      Object.keys(c).forEach(function (a) {
          titleText.style[a] = c[a];
      });
      titleText.id = "title-text";
      newContent = document.createTextNode("apple pie");
      titleText.appendChild(newContent);
      navbar.appendChild(titleText);

      //X button CSS
      xButton = document.createElement("button");
      c = {
          backgroundColor: "white",
          border: "none",
          fontFamily: "Retron2000",
          color: "black",
          fontSize: "26pt",
          cursor: "pointer",
      };
      Object.keys(c).forEach(function (a) {
          xButton.style[a] = c[a];
      });

      xButton.innerHTML = "❌";
      xButton.id = "x-button";

      xButton.onclick = function() {
          menuBg.remove();
          enableClick(map);
          document.getElementById("menu-button").style.display = "block";
      }
      navbar.appendChild(xButton);

      buttonContainer = document.createElement("div");
      c = {
        display: "flex",
        margin: "10px",
        alignItems: "center",
        justifyContent: "space-between", 
      }
      Object.keys(c).forEach(function (a) {
          buttonContainer.style[a] = c[a];
      });
      buttonContainer.className = "button-container";
      button1 = createMenuButton("button1", "t", "13vw");
      button2 = createMenuButton("button2", "t", "13vw");
      button2.disabled = true;
      button3 = createMenuButton("button3", "t", "13vw");
      button4 = createMenuButton("button4", "t", "13vw");
      button5 = createMenuButton("button5", "t", "13vw");


     
      buttonContainer.appendChild(button1);
      buttonContainer.appendChild(button2);
      buttonContainer.appendChild(button3);
      buttonContainer.appendChild(button4);
      buttonContainer.appendChild(button5);


      filtersAndCards = document.createElement("div");
      c = {
        display: "flex",
        alignItems: "start",
        justifyContent: "space-between",
      }
      Object.keys(c).forEach(function (a) {
          filtersAndCards.style[a] = c[a];
      });
      filtersAndCards.id = "filters-and-cards-div";
      filtersDiv = document.createElement("div");
      c = {
        display: "flex",
        alignItems: "left",
        justifyContent: "space-between",
        padding: "10px",
        flexDirection: "column",
        width: "19%",
        backgroundColor: "#f2f2f2",
        // marginRight: "2%",
      }
      Object.keys(c).forEach(function (a) {
          filtersDiv.style[a] = c[a];
      });
      filtersDiv.id = "filters-div";
      button6 = createMenuButton("button6", "t", "13vw");
      button11 = createMenuButton("button6", "t", "13vw");
      button16 = createMenuButton("button6", "t", "13vw");
      button17 = createMenuButton("button6", "t", "13vw");
      button18 = createMenuButton("button6", "t", "13vw");

    
      filtersDiv.appendChild(button6);
      filtersDiv.appendChild(button11);
      filtersDiv.appendChild(button16);

      filtersAndCards.appendChild(filtersDiv);
      cardsDiv = document.createElement("div");
      cardsDiv.addEventListener('wheel', (e) => {
        console.log("hello)")
        e.stopImmediatePropagation()
        e.stopPropagation();
        // e.preventDefault();
        cardsDiv.focus();
      });
      c = {
        display: "flex",
        alignItems: "center",
        rowGap: "10px",
        width: "79%",
        flexWrap: "wrap",
        overflowX: "hidden",
        overflowY: "scroll",
        // scrollbarWidth: "thin",
        scrollbarGutter: "stable",
      }
      Object.keys(c).forEach(function (a) {
          cardsDiv.style[a] = c[a];
      });
      cardsDiv.id = "cards-div";
      button7 = createMenuCard("button7", "t", "13vw");
      button8 = createMenuCard("button8", "t", "13vw");
      button9 = createMenuCard("button9", "t", "13vw");
      button10 = createMenuCard("button10", "t", "13vw");
      button12 = createMenuCard("button12", "t", "13vw");
      button13 = createMenuCard("button13", "t", "13vw");
      button14 = createMenuCard("button14", "t", "13vw");
      button15 = createMenuCard("button15", "t", "13vw");
      





      cardsDiv.appendChild(button7);
      cardsDiv.appendChild(button8);
      cardsDiv.appendChild(button9);
      cardsDiv.appendChild(button10);
      cardsDiv.appendChild(button12);
      cardsDiv.appendChild(button13);
      cardsDiv.appendChild(button14);
      cardsDiv.appendChild(button15);



      filtersAndCards.appendChild(cardsDiv);


      


      

      menuBg.appendChild(navbar);
      menuBg.appendChild(buttonContainer);
      menuBg.appendChild(filtersAndCards);
      document.body.appendChild(menuBg);
      
      

    }



    


    let cleanModLoader = {
        async init() {
            var b=document.createElement("div")
            c={backgroundColor:"rgba(150,10,1,0.8)",width:"5px",height:"5px",position:"absolute",bottom:"5px",right:"5px", zIndex:"2147483647", display:"none"}
            Object.keys(c).forEach(function(a){b.style[a]=c[a]})
            b.id = "cheat-indicator"
            document.body.appendChild(b)
            function addStyle(styleString) {
                const style = document.createElement('style');
                style.textContent = styleString;
                document.head.append(style);
              }
            addStyle(`
            #ovo-multiplayer-disconnected-container {
                pointer-events: none;
            }
            #ovo-multiplayer-other-container {
                pointer-events: none;
            }
            #ovo-multiplayer-container {
                pointer-events: none;
            }
            #ovo-multiplayer-tab-container {
                pointer-events: all;
            }
            .ovo-multiplayer-button-holder {
                pointer-events: all;
            }
            .ovo-multiplayer-tab {
                pointer-events: all;
            }
            .ovo-multiplayer-button {
                pointer-events: all;
            }
            
            `);

            backendConfig = await fetch('../src/mods/modloader/config/generalMods.json')
            .then((response) => response.json())
            .then(jsondata => {
                return jsondata;
            });
            // console.log(backendConfig['mods'])

            userConfig = JSON.parse(localStorage.getItem('modSettings'));
            // console.log(userConfig)
            
            if(userConfig === null) {
                //first time user
                freshUserConfig = {}
                for (const [key] of Object.entries(backendConfig['mods'])) {
                    freshUserConfig[key] = backendConfig["mods"][key]['defaultSettings'];
                }
                localStorage.setItem('modSettings', JSON.stringify(freshUserConfig));
            } else if(userConfig['version'] === undefined) {
                //using old save format
                freshUserConfig = {}
                for (const [key] of Object.entries(backendConfig['mods'])) {
                    freshUserConfig[key] = backendConfig["mods"][key]['defaultSettings'];
                    if(userConfig[key] !== undefined) { //old save format didn't show mods that werent on version
                        freshUserConfig[key]['enabled'] = userConfig[key]['enabled'];
                    }
                }
                //migrate old custom mods to current format
                for(const [key] of Object.entries(userConfig)) {
                    if(backendConfig['mods'][key] === undefined) { //custom mod
                        customModConfig = userConfig[key];
                        customModConfig['author'] = null;
                        customModConfig['icon'] = "https://cdn0.iconfinder.com/data/icons/web-development-47/64/feature-application-program-custom-512.png"
                        customModConfig['platform'] = ["pc", "mobile"];
                        customModConfig['version'] = ["1.4", "1.4.4", "CTLE"];
                        customModConfig['tags'] = ['custom'];
                        customModConfig['settings'] = null;
                        freshUserConfig[key] = customModConfig;
                        customModNum++;
                    }
                }
                localStorage.setItem('modSettings', JSON.stringify(freshUserConfig));
            } else if(userConfig['version'] !== backendConfig['version']) {
                //new version
                freshUserConfig = {}
                for (const [key] of Object.entries(backendConfig['mods'])) {
                    if(userConfig[key] === undefined) {
                        freshUserConfig[key] = backendConfig["mods"][key]['defaultSettings'];
                    } else {
                        freshUserConfig[key] = userConfig[key];
                    }
                }
                localStorage.setItem('modSettings', JSON.stringify(freshUserConfig));
            }
            userConfig = JSON.parse(localStorage.getItem('modSettings'));
            console.log(userConfig)
            console.log(backendConfig)


            //enable mods
            for (const [key] of Object.entries(userConfig)) {
                // console.log(backendConfig['mods'][key])
                if(userConfig[key]['enabled'] === true && backendConfig['mods'][key]['version'].includes(version) && backendConfig['mods'][key]['platforms'].includes(detectDeviceType())) {
                    if(backendConfig['mods'][key] === undefined || !backendConfig['mods'][key]['tags'].includes('visual')) { 
                        //non visual mods or custom mods are considered 'cheats'
                        document.getElementById("cheat-indicator").style.display = "block";
                    }
                    js = document.createElement("script");
                    js.type = "application/javascript";
                    if(key.startsWith("customMod")) {
                        js.text = userConfig[key]["url"];
                    } else {

                        js.src = backendConfig['mods'][key]["url"];
                    }
                    js.id = key;
                    document.head.appendChild(js);
                }
            }
                        

            document.addEventListener("keydown", (event) => {
                this.keyDown(event)
                
            });
            document.addEventListener("keyup", (event) => {
                this.keyUp(event)
            });


            
            
            createModLoaderMenuBtn();

            notify("QOL Modloader", "by Awesomeguy", "https://cdn3.iconfinder.com/data/icons/work-life-balance-glyph-1/64/quality-of-life-happiness-heart-512.png");


        },

        keyDown(event) {

            if(event.keyCode === 192) { //backtick
                if(document.getElementById("menu-bg") === null) { //menu doesnt exist
                    //create mod menu via tab
                    document.getElementById("menu-button").click();
                    // map = disableClick();
                    // createModLoaderMenu(); 
                } else { //menu exists
                    //remove mod menu via tab
                    if(document.getElementById("confirm-bg") === null) {
                        document.getElementById("x-button").click();
                    }         
                }
                 
            }
            
        },
      
        keyUp(event) {
            
            
        },

        

        
      
        
        
        tick() {
            playerInstances = runtime.types_by_index.filter((x) =>!!x.animations &&x.animations[0].frames[0].texture_file.includes("collider"))[0].instances.filter((x) => x.instance_vars[17] === "" && x.behavior_insts[0].enabled);
            player = playerInstances[0];
            
            try {

                
                
            } catch (err) {
                console.log(err);
            }
        }
    };
  
    setTimeout(onFinishLoad, timers[0]);
})();