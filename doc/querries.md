### QUERRY

```mysql
SELECT * 
FROM noteit.general_view
WHERE authornotes in(
	SELECT idusers 
    FROM noteit.userstogroups 
    WHERE idgroups IN (
		SELECT idgroups 
        FROM noteit.userstogroups 
        WHERE idusers = '1'))
;
```

#### INNER JOIN
```mysql
SELECT
	users.nameusers,
    permissions.permission
FROM permissions
INNER JOIN users ON permissions.idobject=users.idusers
WHERE permissions.idnote = 10
;
```


### VIEW

```mysql
CREATE 
VIEW `general_view` AS
    SELECT 
        `notes`.`bodynotes` AS `bodynotes`,
        `notes`.`authornotes` AS `authornotes`,
        `notes`.`category` AS `category`,
        `users`.`nameusers` AS `nameusers`
    FROM
        (`notes`
        JOIN `users`)
    WHERE
        `notes`.`authornotes` = `users`.`idusers`
```

