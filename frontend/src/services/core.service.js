const getQuestions = (itemId) => {
    return fetch(`http://localhost:3333/item/${itemId}/question`,{
        headers: {
            "Content-Type": "application/json",
        }
    })
        .then(res => {
        if (res.status === 200) return res.json();
        else if (res.status === 404) throw 'User not found';
        else throw 'Failed to fetch user'
    })
    .catch(err => {
        console.log("Err", err);
        return Promise.reject(err);
    })
    }

const userInformation = (userId = localStorage.getItem('user_id')) => {
    return fetch(`http://localhost:3333/users/${userId}` , {
       headers: {
                    "Content-Type": "application/json",
                    "X-Authorization": localStorage.getItem("session_token")
                }
    })
    .then(res => {
        if (res.status === 200) return res.json();
        else if (res.status === 404) throw 'User not found';
        else throw 'Failed to fetch user'
    })
    .catch(err => {
        console.log("Err", err);
        return Promise.reject(err);
    })
}

const logOut = (router) => {
    return fetch("http://localhost:3333/logout",
        {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
                "X-Authorization": localStorage.getItem("session_token")
            }
        })
        .then((response) => {
            if(response.status === 200){
                localStorage.removeItem("user_id")
                localStorage.removeItem("session_token")
                router.push('/login')
                return
            }else if(response.status === 401){
                throw 'Not  logged in'
            }else{
                throw 'Something went wrong'
            }
        })
        .catch((err) => {
            console.log("Err", err)
            return Promise.reject(err)
        })
}

const searchItems = () => {
    return fetch("http://localhost:3333/search")
    .then((response) => {
        if(response.status === 200){
            return response.json()
        }else{
            throw 'something went wrong'
        }
    })
    .then((resJson) => {
        return resJson
    })
    .catch((err) => {
        console.log("Err", err)
        return Promise.reject(err)
    })
}

const createItem = (item) => {
     return fetch(`http://localhost:3333/item`, {
             method: "POST",
             headers: {
                "Content-Type": "application/json",
               "X-Authorization": localStorage.getItem("session_token")
            },
            body: JSON.stringify(item)
     })
     .then(res => {
            if(!res.ok) return res.json().then(e => Promise.reject(e))
                return res.json();
        })
}

const getSingleItem = (id) => {
    return fetch(`http://localhost:3333/item/${id}`)
        .then((response) => {
            if(response.status === 200) return response.json();
            else if(response.status === 404) throw 'Item not found';
            else throw 'Something went wrong';
        });
};

const CreateAccount = (first_name, last_name, email, password) => {
                    return fetch("http://localhost:3333/users",
                        {
                            method: 'POST',
                            headers: {
                                "Content-Type": "application/json"
                            },
                            body: JSON.stringify({
                                "first_name": first_name,
                                "last_name": last_name,
                                "email": email,
                                "password": password
                            })
                        }
                    )
                    .then((response) => {
                        if(response.status === 201){
                            return response.json()
                        }else if(response.status === 400){
                            throw 'Bad request'
                        }else{
                            throw 'Something went wrong'
                        }
                    })
                    .catch((err) => {
                        console.log("Err", err)
                        return  Promise.reject(err)
                    });
                };

export const coreService = {
    searchItems,
    logOut,
    getSingleItem,
    createItem,
    CreateAccount,
    userInformation,
    getQuestions
    
}