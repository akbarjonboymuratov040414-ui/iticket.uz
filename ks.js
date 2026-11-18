document.addEventListener("DOMContentLoaded", () => {
  Events.forEach(Events => {
    if(Events.yunalish == "sport"){

        let col5 = document.createElement("div")
        col5.classList.add("col-5")
        col5.innerHTML = `
                <a href="single.html?id=${Events.id}" style="text-decoration:">
            
                <div class="card mb-3" style="max-width:540px">
                  <div class="row g-0">
                    <div class="col-md-4">
                      <img style="width: 200px; height: 200px;" src="${Events.rasm}" class="img-fluid rounded-start" alt="...">
                    </div>
                    <div class="col-md-8">
                      <div class="card-body">
                        <p style="color="white" class="card-text text-success">${Events.joy}</p>
                        <h5 style="color="white" class="card-title">${Events.title}</h5>
                        <p style="color="white" class="card-text">${Events.category}</p>
                        <p style="color="white" class="card-text"><small class="text-body-secondary">Batafsil -></small></p>
                      </div>
                    </div>
                  </div>
                </div>
        </a>
            `
        document.querySelector(".row").append(col5)
    }
  })
})
