window.onload = function() {
    var cpc = document.querySelector("#cpc");
    var cp = document.querySelector("#cp");
    //var sites = document.querySelectorAll(".site-link");
    var count[];
    count[0] = 0;
    cpc.addEventListener('click', function(count) {
        count[0]++;
        if(count[0] == 5) {
            cp.style.display = "initial";
        }
    })
}
