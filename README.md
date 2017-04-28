<p align="center">
    <img src="https://cdn.pbrd.co/images/X9oDfxiv.png" width="200px"></img>
</p>

# Medusa!
    Adding dynamic content in your static app.

## Introduction 
Initally, this module was thought to add comments to jekyll pages, but in a near feature, it could be also used for any static page where it's needed to add some dynamism. 

## Arquicture

<p align="center">
    <img src="https://cdn.pbrd.co/images/9xmbgFhvM.png" width="700px"></img>
</p>

### Comments system example
Our static page, in our case implemented using Jekyll, will have a form with data (name, email, comment, and any further element that it's needed to be shown). That data, will be send to medusa. Once the data is recieved, mesuda is  going to create a new file using the the following path: _data/ArticleName/timestamp.yml. 
After that, medusa will create commit and it will pushed to a particular branch, that must be established in in the config file. 

## Setup
### Config json 

```json
{
    "repoFolder": "repoFolder", // it will keep the jekyll repository
    "server": {
        "ip": "127.0.0.1",
        "port": "3500"
    },
    "git": {
        "username": "userame",
        "email": "youremail@domain.com",
        "repo": "myRepository.github.io.git", // if the repo is inside an organization => organization/myRepository.github.io.git
        "repoName": "myRepository.github.io",
        "branch": "my-projec-comments",
        "remote": "origin",
        "commitMessage": "New comment - medusa integration"
    }
}
```

### Git token
For pushing the comments into the repository, medusa will need a gittoken. [Creating a personal token in github](https://help.github.com/articles/creating-a-personal-access-token-for-the-command-line/), after that, the token should be copied inside a .gittoken file.


