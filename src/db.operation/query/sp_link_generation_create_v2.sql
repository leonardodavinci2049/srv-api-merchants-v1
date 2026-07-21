DELIMITER $$
CREATE PROCEDURE `sp_link_generation_create_v2`(
											`PE_UUID` VARCHAR(100), 
                                            `PE_CLIENT_ID` INT, 
                                            `PE_APP_ID` INT, 
                                            `PE_LINK_DESTINATION` VARCHAR(500), 
                                            `PE_AFFILIATE_LINK` VARCHAR(500), 
                                            `PE_FLAG_CLICK` SMALLINT, 
                                            `PE_ITEM_ID` BIGINT, 
                                            `PE_PRODUCT_NAME` VARCHAR(500), 
                                            `PE_SHOP_NAME` VARCHAR(255), 
                                            `PE_SHOP_ID` BIGINT, 
                                            `PE_PRICE_MIN` DECIMAL(18,2), 
                                            `PE_PRICE_MAX` DECIMAL(18,2), 
                                            `PE_COMMISSION_RATE` DECIMAL(18,2), 
                                            `PE_COMMISSION` DECIMAL(18,2), 
                                            `PE_SALES` INT, `PE_RATING_STAR` DECIMAL(3,2), 
                                            `PE_IMAGE_URL` VARCHAR(1000), 
                                            `PE_PRODUCT_LINK` VARCHAR(1000), 
                                            `PE_OFFER_LINK` VARCHAR(1000), 
                                            `PE_CURRENCY` VARCHAR(10), 
                                            `PE_DISCOUNT_PERCENT` DECIMAL(18,2), 
                                            `PE_ORIGINAL_PRICE` DECIMAL(18,2), 
                                            `PE_CATEGORY` VARCHAR(255), 
                                            `PE_CATEGORY_ID` BIGINT, 
                                            `PE_BRAND_NAME` VARCHAR(255), 
                                            `PE_IS_OFFICIAL` TINYINT, 
                                            `PE_FREE_SHIPPING` TINYINT, 
                                            `PE_LOCATION` VARCHAR(255))
main_block: BEGIN
    DECLARE sp_return_id INT DEFAULT 0;
    DECLARE sp_message VARCHAR(500) DEFAULT '';
    DECLARE sp_error_id INT DEFAULT 0;
    DECLARE pl_exists_record_id INT DEFAULT 0;  
    DECLARE pl_log VARCHAR(500) DEFAULT '';      


-- Critérios para os parâmetros obrigatórios

    IF ((PE_APP_ID IS NULL) OR (PE_APP_ID < 1)) THEN
        SET sp_return_id = 0;
        SET sp_message = 'Error! Informe APP_ID Válido';
        SET sp_error_id = 1;
        
        SELECT
            sp_return_id,
            sp_message,
            sp_error_id;
        LEAVE main_block;
    END IF;
    
-- Validação do link de destino (campo obrigatório)
    IF ((PE_LINK_DESTINATION IS NULL) OR (TRIM(PE_LINK_DESTINATION) = '')) THEN
        SET sp_return_id = 0;
        SET sp_message = 'Error! Informe um link de destino válido';
        SET sp_error_id = 1;
        
        SELECT
            sp_return_id,
            sp_message,
            sp_error_id;

        LEAVE main_block;
		
    END IF;  
    
-- Insert record

	INSERT INTO tbl_link_generation (      
        tbl_link_generation.UUID,
         tbl_link_generation.CLIENT_ID,           
        tbl_link_generation.APP_ID,      
		tbl_link_generation.LINK_DESTINATION,             
		tbl_link_generation.AFFILIATE_LINK,  
		tbl_link_generation.FLAG_CLICK,                 
		tbl_link_generation.ITEM_ID, 
		tbl_link_generation.PRODUCT_NAME, 
		tbl_link_generation.SHOP_NAME, 
		tbl_link_generation.SHOP_ID,
		tbl_link_generation.PRICE_MIN,
		tbl_link_generation.PRICE_MAX,
		tbl_link_generation.COMMISSION_RATE,
		tbl_link_generation.COMMISSION,
		tbl_link_generation.SALES,
		tbl_link_generation.RATING_STAR,
		tbl_link_generation.IMAGE_URL,
		tbl_link_generation.PRODUCT_LINK,
		tbl_link_generation.OFFER_LINK,
		tbl_link_generation.CURRENCY,
		tbl_link_generation.DISCOUNT_PERCENT,
		tbl_link_generation.ORIGINAL_PRICE,
		tbl_link_generation.CATEGORY,
		tbl_link_generation.CATEGORY_ID,
		tbl_link_generation.BRAND_NAME,
		tbl_link_generation.IS_OFFICIAL,
		tbl_link_generation.FREE_SHIPPING,
		tbl_link_generation.LOCATION,
		tbl_link_generation.CREATEDAT,
		tbl_link_generation.UPDATEDAT        
	)  VALUES (    
		PE_UUID,
		PE_CLIENT_ID, 
		PE_APP_ID,
		PE_LINK_DESTINATION,           
		PE_AFFILIATE_LINK,
		COALESCE(PE_FLAG_CLICK, 0),                 
		PE_ITEM_ID, 
		PE_PRODUCT_NAME, 
		PE_SHOP_NAME,
		PE_SHOP_ID,
		PE_PRICE_MIN,
		PE_PRICE_MAX,
		PE_COMMISSION_RATE,
		PE_COMMISSION,
		COALESCE(PE_SALES, 0),
		PE_RATING_STAR,
		PE_IMAGE_URL,
		PE_PRODUCT_LINK,
		PE_OFFER_LINK,
		COALESCE(PE_CURRENCY, 'BRL'),
		PE_DISCOUNT_PERCENT,
		PE_ORIGINAL_PRICE,
		PE_CATEGORY,
		PE_CATEGORY_ID,
		PE_BRAND_NAME,
		COALESCE(PE_IS_OFFICIAL, 0),
		COALESCE(PE_FREE_SHIPPING, 0),
		PE_LOCATION,
		CURRENT_TIMESTAMP(),     
		CURRENT_TIMESTAMP() 
	);                        
        
    SET sp_return_id = (SELECT
						tbl_link_generation.ID
						FROM tbl_link_generation       
						WHERE tbl_link_generation.UUID = PE_UUID
						LIMIT 1);    

    IF ((sp_return_id > 0) AND (sp_return_id IS NOT NULL)) THEN   
        SET sp_message = 'Cadastro criado com sucesso';
        SET sp_error_id = 0; 
	-- Log the Operation    

        SET pl_log = CONCAT('action: link generation created - ID: ', sp_return_id);
        
	INSERT INTO tbl_log_operation (	UUID,MODULE_ID, RECORD_ID,LOG,NOTE,	CREATEDAT
					) VALUES (PE_UUID,1,sp_return_id,'sp_link_generation_create_v2',pl_log,CURRENT_TIMESTAMP());           
        

    ELSE
        SET sp_return_id = 0;
        SET sp_message = 'Erro no processo de criar o cadastro';
        SET sp_error_id = 1; 
        
    END IF;            
        
    SELECT
        sp_return_id,
        sp_message,
        sp_error_id;
END$$
DELIMITER ;
