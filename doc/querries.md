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
        WHERE idusers = '1'));
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

