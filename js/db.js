var dbPromise = idb.open("mydatabase", 1, function(upgradeDb) {
    if (!upgradeDb.objectStoreNames.contains("pokemons")) {
        upgradeDb.createObjectStore("pokemons", {keyPath: 'id', autoIncrement: true});
    }
    console.log('Object store created!')
});

function addPokemon() {
    if (!('indexedDB' in window)) {
        console.log('This browser doesn\\\'t support IndexedDB');
        return;
    }

    var urlParams = new URLSearchParams(window.location.search);
    var nameParam = urlParams.get("name");

    fetch(base_url + "pokemon/" + nameParam)
        .then(status)
        .then(json)
        .then(function (data) {
            dbPromise.then(function (db) {
                if ('PushManager' in window) {
                    navigator.serviceWorker.getRegistration()
                        .then(function (reg) {
                            reg.showNotification(`Pokemon ${data.name} added to your favourite list`);
                        });
                }

                var tx = db.transaction('pokemons', 'readwrite');
                var store = tx.objectStore('pokemons');
                var pokemon = {
                    name: `${data.name}`
                };
                store.put(pokemon);
                return tx.complete;
            }).then(function () {
                window.location.href = "fav-pokemon.html";
                console.log('Pokemon successfully added');
            }).catch(function (error) {
                alert('Fail to add pokemon :(');
                console.log('Pokemon failed to added');
                console.log(error);
            });
        });
}

function getAllFavPokemon() {
    dbPromise.then(function (db) {
        var tx = db.transaction('pokemons', 'readonly');
        var store = tx.objectStore('pokemons');

        return store.getAll();
    }).then(function (pokemons) {
        console.log('Data successfully fetch : ', pokemons);

        var favouriteHTML = "";

        if (pokemons == 0){
            favouriteHTML += `
                    <p class="center-align">You don't have any favourite pokemon :(</p>
                `;

            document.getElementById('body-content').innerHTML = favouriteHTML;
        }else{
            pokemons.forEach(function (pokemon) {
                favouriteHTML += `
                    <ul class="collection with-header">
                      <li class="collection-item">
                        <div>
                            ${pokemon.name}
                            <a href="#" onclick='deletePokemon(${pokemon.id})'>
                                <i class="material-icons right">delete</i>
                            </a>
                        </div>
                      </li>
                    </ul>
                    `
            });

            document.getElementById('body-content').innerHTML = favouriteHTML;
        }
    }).catch(function () {
        console.log('Data fail to fetch');
    });
}

function deletePokemon(id) {

    dbPromise.then(function (db) {
        if ('PushManager' in window) {
            navigator.serviceWorker.getRegistration()
                .then(function (reg) {
                    reg.showNotification(`Pokemon successfully removed`);
                });
        }

        var tx = db.transaction('pokemons', 'readwrite');
        var store = tx.objectStore('pokemons');
        store.delete(id);
        return tx.complete;
    }).then(function () {
        window.location.href = "index.html";
        console.log('Pokemon deleted');
    }).catch(function (error) {
        alert('Fail to add team :(');
        console.log(error);
    });
}