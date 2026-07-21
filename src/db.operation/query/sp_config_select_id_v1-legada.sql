DELIMITER $$
CREATE D PROCEDURE `sp_config_select_id_v1`(
				PE_PROJECT_ID INT, 
                PE_CONFIG_ID INT
                )
main_block: begin
    DECLARE pl_record_id INT DEFAULT 0;
    DECLARE pl_feedback VARCHAR(500) DEFAULT '';
    DECLARE pl_error_id INT DEFAULT 0;
    

    DECLARE pl_existing_record INT DEFAULT 0;
    
 -- Check if the SYSTEM ID was entered   
 IF (( PE_PROJECT_ID < 1 ) OR ( PE_PROJECT_ID IS NULL )) THEN
        SET pl_record_id = 0;
        SET pl_feedback = 'Error! Enter a valid PROJECT ID';
        SET pl_error_id = 1;
        SELECT
            pl_record_id,
            pl_feedback,
            pl_error_id;
            
        LEAVE main_block;
    END IF;
  -- validates if the user exists 
   SET  pl_existing_record =  ( select
									tbl_config.CONFIG_ID
								from
								   tbl_config
								  WHERE tbl_config.PROJECT_ID = PE_PROJECT_ID
								  AND tbl_config.CONFIG_ID = PE_CONFIG_ID limit 1);
 -- validates if the user exists 
  IF (( pl_existing_record < 1 ) OR ( pl_existing_record IS NULL )) THEN
        SET pl_record_id = 0;
        SET pl_feedback = 'Error! Enter Valid CONFIG ID';
        SET pl_error_id = 1;
        SELECT
            pl_record_id,
            pl_feedback,
            pl_error_id;
            
        LEAVE main_block;
    END IF;   


-- list the settings
		SELECT  
			tbl_config.CONFIG_ID,
   			tbl_config.CLIENT_ID,   
           
			tbl_config.CUSTOMER_NAME,
			tbl_config.TELEGRAM_BOT_NAME,
			tbl_config.TELEGRAM_BOT_LINK,
			tbl_config.TELEGRAM_BOT_TOKEN,
			tbl_config.TELEGRAM_BOT_CHATID,
			tbl_config.WEBHOOK_URL, 
			tbl_config.WEBHOOK_LOCAL_PORT,
			tbl_config.OPENAI_API_KEY,
			tbl_config.SHOPEE_CREDENTIAL,
			tbl_config.SHOPEE_SECRET_KEY,
			tbl_config.SHOPEE_AFFILIATE_ENDPOINT,
			tbl_config.SHOPEE_AFFILIATE_TIMEOUT,
			tbl_config.SHOPEE_AFFILIATE_SUBIDS,

			tbl_config.SHOPEE_PAGE,
			tbl_config.SHOPEE_SORTTYPE,
			tbl_config.SHOPEE_LIMIT,

			tbl_config.SHOPEE_APP_ID,
			tbl_config.SHOPEE_FLAG_CLICK,
			tbl_config.SHOPEE_CURRENCY,
			tbl_config.SHOPEE_LOCATION,       
			tbl_config.ACTIVE_FLAG,             
			tbl_config.CREATEDAT,
			tbl_config.UPDATEDAT
		  FROM                                          
			 tbl_config
	  WHERE tbl_config.PROJECT_ID = PE_PROJECT_ID
	  AND tbl_config.CONFIG_ID = PE_CONFIG_ID limit 1;
-- feedback   
  	SET pl_record_id = 1;
	SET pl_feedback = 'Query returned successfully';
	SET pl_error_id = 0;  
    SELECT
        pl_record_id,
        pl_feedback,
        pl_error_id;
        
end$$
DELIMITER ;
