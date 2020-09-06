function createPanel()
{
    let panel = document.getElementById("krtekpanel");
    if (panel)
        document.body.removeChild(panel);

    panel = document.createElement("div");

    panel.id = "krtekpanel";
    panel.style.zIndex = 1000;
    panel.style.fontSize = "50px";
    panel.style.width = "auto";
    panel.style.backgroundColor = "#FFFFFF33";
    panel.style.position = "fixed";
    panel.style.right = 0;
    panel.style.top = 0;

    panel.style.display = "flex";
    panel.style.flexDirection = "column";
    panel.style.alignItems = "center";

    document.body.appendChild(panel);

    let counter = document.createElement("div");
    counter.id = "krtekcounter";
    counter.style.color = "white";
    counter.textContent = "0";
    panel.appendChild(counter);

    let nameview = document.createElement("div");
    nameview.id = "krteknametag";
    nameview.style.color = "white";
    nameview.textContent = "";
    nameview.style.fontSize = "15px";
    panel.appendChild(nameview);
}

createPanel();

function setCounter(count)
{
    let counter = document.getElementById("krtekcounter");
    counter.textContent = count;
}

function setPlayerName(name)
{
    let nameview = document.getElementById("krteknametag");
    nameview.textContent = name;
}